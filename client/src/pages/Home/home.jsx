import Header from "../../components/header";
import AboutUs from "./components/aboutUs";
import Catalog from "./components/catalog";
// import Footer from "./components/footer";

const Home = () => {
  return (
    <div>
      <Header />
      <main>
        <Catalog />
        <AboutUs />
      </main>
      {/* <Footer /> */}
    </div>
  );
};

export default Home;
