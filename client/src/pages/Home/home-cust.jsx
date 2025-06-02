import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/header-cust";
import AboutUs from "./components/aboutUs";
import Catalog from "./components/catalog";
import Footer from "./components/footer";
import Chatbot from "../../components/Chatbot";

const CustHome = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await fetch('/api/user/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }

        const user = await response.json();
        
        // Check if user has customer role
        if (user.role !== 'customer') {
          navigate('/login');
          return;
        }

        setUserData(user);
      } catch (error) {
        console.error("Error fetching user data:", error);
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="home-page">
      <Header userData={userData} />
      <main>
        <Catalog />
        <AboutUs />
        {userData && (
          <Chatbot 
            userId={userData._id}
            secretKey="p4o6jnikuydy7iedqgrv8cb5q925xnmn"
          />
        )}
      </main>
      <Footer />
    </div>
  );
};

export default CustHome;