import React from "react";
import Header from "../../components/header";
import AboutUs from "./components/aboutUs";
import Catalog from "./components/catalog";
import Footer from "./components/footer";
import "./home.css";

const Home = () => {
  return (
    <div>
      <Header />
      <main>
        <Catalog />
        <AboutUs />
      </main>
      <Footer />
    </div>
  );
};

export default Home;
