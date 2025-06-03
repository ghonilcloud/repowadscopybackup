import '../styles/aboutUs.css';
import storeImage from '../assets/store-image.jpg';


const AboutUs = () => {
    return (
      <section>
        <div className="aboutUs-title-wrapper">
          <h2 className="aboutUs-title">About Us</h2>
        </div>
        <div className="about-us-container">
          <img className='store-image' src={storeImage} alt="store"/>
          <div className="about-us-content">
            <p><strong>Instagram</strong>: @cottoneight</p>
            <p><strong>Email</strong>: cottoneight@gmail.com</p>
            <p><strong>Address</strong>: ITC Kuningan Mall Ambassador, Jakarta, Indonesia</p>
          </div>
        </div>
      </section>
    );
};

export default AboutUs;