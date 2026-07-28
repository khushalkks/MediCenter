import React, { useContext, useEffect, useState } from 'react'
import { DoctorContext } from '../../context/DoctorContext'
import { AppContext } from '../../context/AppContext'
import { assets } from '../../assets/assets'

const DoctorAppointments = () => {

  const { dToken, appointments, getAppointments, cancelAppointment, completeAppointment } = useContext(DoctorContext)
  const { slotDateFormat, calculateAge, currency } = useContext(AppContext)

  const [activeCompletionId, setActiveCompletionId] = useState(null)
  const [docNotes, setDocNotes] = useState("")

  useEffect(() => {
    if (dToken) {
      getAppointments()
    }
  }, [dToken])

  return (
    <div className='w-full max-w-6xl m-5 '>

      <p className='mb-3 text-lg font-medium'>All Appointments</p>

      <div className='bg-white border rounded text-sm max-h-[80vh] overflow-y-scroll'>
        <div className='max-sm:hidden grid grid-cols-[0.5fr_2fr_1fr_1fr_3fr_1fr_1fr] gap-1 py-3 px-6 border-b'>
          <p>#</p>
          <p>Patient</p>
          <p>Payment</p>
          <p>Age</p>
          <p>Date & Time</p>
          <p>Fees</p>
          <p>Action</p>
        </div>
        {appointments.map((item, index) => (
          <div className='flex flex-wrap justify-between max-sm:gap-5 max-sm:text-base sm:grid grid-cols-[0.5fr_2fr_1fr_1fr_3fr_1fr_1fr] gap-1 items-center text-gray-500 py-3 px-6 border-b hover:bg-gray-50' key={index}>
            <p className='max-sm:hidden'>{index}</p>
            <div className='flex items-center gap-2'>
              <img src={item.userData.image} className='w-8 rounded-full' alt="" /> <p>{item.userData.name}</p>
            </div>
            <div>
              <p className='text-xs inline border border-primary px-2 rounded-full'>
                {item.payment?'Online':'CASH'}
              </p>
            </div>
            <p className='max-sm:hidden'>{calculateAge(item.userData.dob)}</p>
            <p>{slotDateFormat(item.slotDate)}, {item.slotTime}</p>
            <p>{currency}{item.amount}</p>
            {item.cancelled
              ? <p className='text-red-400 text-xs font-medium'>Cancelled</p>
              : item.isCompleted
                ? <p className='text-green-500 text-xs font-medium'>Completed</p>
                : <div className='flex'>
                  <img onClick={() => cancelAppointment(item._id)} className='w-10 cursor-pointer' src={assets.cancel_icon} alt="" />
                  <img onClick={() => setActiveCompletionId(item._id)} className='w-10 cursor-pointer' src={assets.tick_icon} alt="" />
                </div>
            }
          </div>
        ))}
      </div>

      {/* Clinical Notes Modal Overlay */}
      {activeCompletionId && (
        <div className='fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 font-sans'>
          <div className='bg-white w-full max-w-md p-6 rounded-2xl border border-gray-100 shadow-xl flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200'>
            <div>
              <h3 className='text-lg font-bold text-gray-800'>Complete Appointment & Clinical Notes</h3>
              <p className='text-xs text-gray-400 mt-1 leading-relaxed'>
                Add diagnosis details or prescription guidelines below. Our AI Agent will analyze these notes to automatically recommend follow-up schedules.
              </p>
            </div>
            <textarea 
              value={docNotes}
              onChange={(e) => setDocNotes(e.target.value)}
              placeholder='e.g., Blood sugar checkup in 2 weeks. Monitor blood pressure daily.' 
              className='w-full p-3 border border-gray-200 rounded-xl text-sm focus:outline-primary h-28 resize-none'
            />
            <div className='flex gap-3 justify-end text-sm font-semibold'>
              <button 
                onClick={() => {
                  setActiveCompletionId(null);
                  setDocNotes("");
                }}
                className='px-4 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-all'
              >
                Cancel
              </button>
              <button 
                onClick={async () => {
                  await completeAppointment(activeCompletionId, docNotes);
                  setActiveCompletionId(null);
                  setDocNotes("");
                }}
                className='px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition-all'
              >
                Confirm Completion
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default DoctorAppointments