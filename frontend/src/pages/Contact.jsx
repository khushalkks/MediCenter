import React from 'react';
import { assets } from '../assets/assets';

const Contact = () => {
  return (
    <div className="bg-gradient-to-b from-white to-white-100 p-10">

      <div className="text-center text-4xl font-bold text-gray-800 mb-10">
        <p>Get in <span className="text-blue-500">Touch</span></p>
      </div>

      <div className="flex flex-col justify-center md:flex-row gap-10 mb-28 text-sm shadow-lg rounded-lg bg-white p-6">
        <img className="w-full md:max-w-[360px] rounded-lg" src={assets.contact_image} alt="Contact" />
        <div className="flex flex-col justify-center items-start gap-6">
          <p className="font-semibold text-2xl text-gray-700">Our Office</p>
          <p className="text-gray-600">E – 18, Block E, Defence Colony <br /> New Delhi, Delhi 110024</p>
          <p className="text-gray-600">Tel: +1-98-658-6526 <br /> HealthifNow@gmail.com</p>
          <p className="font-semibold text-2xl text-gray-700">Join Our Team</p>
          <p className="text-gray-600">Empower healthcare with us — Explore exciting career opportunities.</p>
          <button className="bg-blue-500 text-white px-8 py-4 text-sm font-semibold rounded-lg shadow-md hover:bg-blue-600 transition-all duration-300">Explore Jobs</button>
        </div>
      </div>

    </div>
  );
};

export default Contact;

