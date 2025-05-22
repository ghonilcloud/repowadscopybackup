import homepageImage from '../assets/homepage-image1.png';
import '../styles/catalog.css';
import bottomsImage from '../assets/bottoms.png';
import topsImage from '../assets/tops.png';
import dressesImage from '../assets/dress.png';



const Catalog = () => {
    return (
        <section>
            <div className="image-container">
                <img className="homepage-image" src={homepageImage} alt="Catalog" />
                <h2 className="ready-to-wear-text">Ready to Wear</h2>
            </div>

            <div className="catalog-title-wrapper">
                <h2 className="catalog-title">Our Catalog</h2>
            </div> 
            <div className="catalog-image-container">
            <div className="catalog-item">
                <img className="catalog-image" src={topsImage} alt="tops-image" />
                <button className="catalog-btn">Shop Tops</button>
            </div>

            <div className="catalog-item">
                <img className="catalog-image" src={bottomsImage} alt="bottoms-image" />
                <button className="catalog-btn">Shop Bottoms</button>
            </div>

            <div className="catalog-item">
                <img className="catalog-image" src={dressesImage} alt="dresses-image" />
                <button className="catalog-btn">Shop Dresses</button>
            </div>
            </div>

        </section>
    );
};

export default Catalog;