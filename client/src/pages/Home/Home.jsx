import React from 'react';
import Hero from './Hero';
// import Features from './Features'; // section no longer needed
import AllProductsGrid from './AllProductsGrid';

const Home = () => {
    return (
        <div>
        <Hero></Hero>
        {/* <Features></Features> */}
        <AllProductsGrid></AllProductsGrid>
        </div>
    );
};

export default Home;
