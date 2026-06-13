import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../context/AppContext'
import { useNavigate, useParams } from 'react-router-dom'

const Doctors = () => {

  const { speciality } = useParams()

  const [filterDoc, setFilterDoc] = useState([])
  const [showFilter, setShowFilter] = useState(false)
  const navigate = useNavigate();

  const { doctors } = useContext(AppContext)
  const applyFilter = () => {
    if (!doctors || doctors.length === 0) {
        console.log("No doctors available in AppContext");
        setFilterDoc([]);
        return;
    }

    if (speciality) {
        console.log("Filtering doctors by speciality:", speciality);
        const filtered = doctors.filter(doc => 
            doc.speciality.toLowerCase() === speciality.toLowerCase()
        );
        console.log("Filtered Doctors After Applying Filter:", filtered);
        setFilterDoc(filtered);
    } else {
        setFilterDoc(doctors);
    }
};

  useEffect(() => {
    console.log("Doctors in AppContext:", doctors);  
    console.log("Current Speciality from URL:", speciality);
    applyFilter();
  }, [doctors, speciality]);
  

  return (
    <div className='w-full grid grid-cols-auto gap-4 gap-y-6'>
  {filterDoc.length === 0 ? (
    <p className="text-center text-gray-500">No doctors available for this speciality.</p>
  ) : (
    filterDoc.map((item, index) => (
      <div key={index} onClick={() => navigate(`/appointment/${item._id}`)} 
           className='border border-[#C9D8FF] rounded-xl overflow-hidden cursor-pointer hover:translate-y-[-10px] transition-all duration-500'>
        <img className='bg-[#EAEFFF]' src={item.image} alt="" />
        <div className='p-4'>
          <div className={`flex items-center gap-2 text-sm text-center ${item.available ? 'text-green-500' : "text-gray-500"}`}>
            <p className={`w-2 h-2 rounded-full ${item.available ? 'bg-green-500' : "bg-gray-500"}`}></p>
            <p>{item.available ? 'Available' : "Not Available"}</p>
          </div>
          <p className='text-[#262626] text-lg font-medium'>{item.name}</p>
          <p className='text-[#5C5C5C] text-sm'>{item.speciality}</p>
        </div>
      </div>
    ))
  )}
</div>

  )
}

export default Doctors