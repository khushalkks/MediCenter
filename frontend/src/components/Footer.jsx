import React from 'react';
import { assets } from '../assets/assets';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';

const Footer = () => {
  return (
    <div className='md:mx-10'>
      <div className='flex flex-col sm:grid grid-cols-[3fr_1fr_1fr] gap-14 my-10 mt-40 text-sm'>

        <div>
          <img className='mb-5 w-40' src={assets.logo} alt="Logo" />
          <p className='w-full md:w-2/3 text-gray-600 leading-7 text-xl font-semibold'>
            "Your health is an investment, not an expense. Prioritize wellness today for a healthier tomorrow."
          </p>

        </div>

        <div>
          <p className='text-xl font-medium mb-5'>COMPANY</p>
          <ul className='flex flex-col gap-2 text-gray-600'>
            <li>Home</li>
            <li>About us</li>
            <li>Delivery</li>
            <li>Privacy policy</li>
          </ul>
        </div>

        <div>
          <p className='text-xl font-medium mb-5'>GET IN TOUCH</p>
          <ul className='flex flex-col gap-2 text-gray-600'>
            <li>+1-98-658-6526</li>
            <li>wellora@gmail.com</li>
          </ul>
        </div>
      </div>

      {/* Social Media and Copyright Section */}
      <div className="text-center mt-10">
        <div className="flex justify-center gap-6 mb-5">
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
            <FaFacebook className="text-2xl text-blue-600 hover:text-blue-800" />
          </a>
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
            <FaTwitter className="text-2xl text-blue-400 hover:text-blue-600" />
          </a>
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
            <FaInstagram className="text-2xl text-pink-500 hover:text-pink-700" />
          </a>
          <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
            <FaLinkedin className="text-2xl text-blue-700 hover:text-blue-900" />
          </a>
        </div>
        <hr />

        <p className='py-5 text-sm'>© 2025 wellora.com - All Rights Reserved.</p>

      </div>
    </div>
  );
}

export default Footer;
