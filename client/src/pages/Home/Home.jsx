import React from 'react';
import Hero from './Hero';
import ProductListPage from '../Products/ProductListPage';
import AllProductsSlide from './AllProductsSlide';
import AllProductsCategory from './AllProductsCategory';
import Test from './Test';

const Home = () => {
    return (
        <div>
        <Hero></Hero>
        <AllProductsSlide></AllProductsSlide>
        {/* <ProductListPage></ProductListPage> */}
        </div>
    );
};

export default Home;