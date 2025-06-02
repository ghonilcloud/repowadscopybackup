import React, { useEffect } from 'react';
import PropTypes from 'prop-types';

const Chatbot = ({ userId, secretKey }) => {
  useEffect(() => {
    // Initialize chatbase
    if (!window.chatbase || window.chatbase("getState") !== "initialized") {
      window.chatbase = (...args) => {
        if (!window.chatbase.q) {
          window.chatbase.q = [];
        }
        window.chatbase.q.push(args);
      };

      window.chatbase = new Proxy(window.chatbase, {
        get(target, prop) {
          if (prop === "q") {
            return target.q;
          }
          return (...args) => target(prop, ...args);
        },
      });
    }

    // Create the hash for user verification using the Web Crypto API
    const generateHash = async () => {
      if (userId && secretKey) {
        const encoder = new TextEncoder();
        const data = encoder.encode(userId.toString());
        const key = encoder.encode(secretKey);
        
        const cryptoKey = await window.crypto.subtle.importKey(
          'raw',
          key,
          { name: 'HMAC', hash: 'SHA-256' },
          false,
          ['sign']
        );
        
        const signature = await window.crypto.subtle.sign(
          'HMAC',
          cryptoKey,
          data
        );

        const hashArray = Array.from(new Uint8Array(signature));
        const hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

        window.chatbase('updateUser', {
          userId: userId.toString(),
          hash: hash
        });
      }
    };

    generateHash();

    // Load the chatbot script
    const script = document.createElement("script");
    script.src = "https://www.chatbase.co/embed.min.js";
    script.id = "cNGjwfgvQRNBW25dGQokE";
    script.domain = "www.chatbase.co";
    document.body.appendChild(script);

    // Cleanup
    return () => {
      const existingScript = document.getElementById("cNGjwfgvQRNBW25dGQokE");
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, [userId, secretKey]);

  return null; // The chatbot widget will be injected by the script
};

Chatbot.propTypes = {
  userId: PropTypes.string.isRequired,
  secretKey: PropTypes.string.isRequired
};

export default Chatbot;