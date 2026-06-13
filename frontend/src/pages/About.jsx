import React from 'react'
import { assets } from '../assets/assets'

const About = () => {
  return (
    <div>

      <div className='text-center text-2xl pt-10 text-[#707070]'>
        <p><span className='text-gray-700 font-semibold'> ABOUT US</span></p>
      </div>

      <div className='my-10 flex flex-col md:flex-row gap-12'>
        <img className='w-full md:max-w-[360px]' src={assets.about_image} alt="" />

        <div className='flex flex-col justify-center gap-6 md:w-2/4 text-sm text-gray-600'>
        <p>Welcome to Wellora — Your Smart Healthcare Ecosystem</p>

          <p>At Wellora, we revolutionize healthcare management by offering a seamless, tech-driven solution that prioritizes accessibility, efficiency, and personalized care. We recognize the complexities of scheduling appointments and maintaining health records, and our platform simplifies the entire journey.</p>

          <p>
          With an unwavering commitment to healthcare innovation, Wellora leverages advanced technologies, including AI-powered scheduling and secure digital health records, to enhance your experience and deliver top-tier service. Whether you're booking your first virtual consultation or managing ongoing treatments, Wellora is your reliable partner at every stage of your healthcare journey.
          </p>
          <b className='text-gray-800'>Our Vision</b>
          <p>Our vision at Wellora is to create a seamless healthcare experience for every user. We aim to bridge the gap  between patients and healthcare providers, making it easier for you to access the care you need, when you need it.</p>
        </div>
      </div>

      <div className='text-xl my-4'>
        <p>  <span className='text-gray-1000 font-semibold'>Why We Stand Out</span></p>
      </div>

      <div className='flex flex-col md:flex-row mb-20'>
        <div className='border px-10 md:px-16 py-8 sm:py-16 flex flex-col gap-5 text-[15px] hover:bg-primary hover:text-white transition-all duration-300 text-gray-600 cursor-pointer'>
          <b>SMART SCHEDULING</b>
          <p>
          Adaptive appointment management to reduce wait times and no-shows.
          </p>
        </div>
        <div className='border px-10 md:px-16 py-8 sm:py-16 flex flex-col gap-5 text-[15px] hover:bg-primary hover:text-white transition-all duration-300 text-gray-600 cursor-pointer'>
          <b>ACCESSIBILITY </b>
          <p>Multilingual support and inclusive design to cater to diverse communities.</p>
        </div>
        <div className='border px-10 md:px-16 py-8 sm:py-16 flex flex-col gap-5 text-[15px] hover:bg-primary hover:text-white transition-all duration-300 text-gray-600 cursor-pointer'>
          <b>INNOVATION</b>
          <p >Leveraging AI and advanced analytics for faster, accurate health insights.</p>
        </div>

        <div className='border px-10 md:px-16 py-8 sm:py-16 flex flex-col gap-5 text-[15px] hover:bg-primary hover:text-white transition-all duration-300 text-gray-600 cursor-pointer'>
          <b>REAL-TIME SUPPORT</b>
          <p >Instant access to virtual consultations and 24/7 health assistance.</p>
        </div>

      </div>

    </div>
  )
}

export default About
