import React, { useContext, useEffect, useState } from 'react'
import { DoctorContext } from '../../context/DoctorContext'
import { assets } from '../../assets/assets'
import { AppContext } from '../../context/AppContext'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, Legend } from 'recharts';

const STATUS_COLORS = {
  completed: '#10B981',
  cancelled: '#EF4444',
  pending: '#F59E0B'
};

const DoctorDashboard = () => {

  const { dToken, dashData, getDashData, cancelAppointment, completeAppointment } = useContext(DoctorContext)
  const { slotDateFormat, currency } = useContext(AppContext)

  const [activeCompletionId, setActiveCompletionId] = useState(null)
  const [docNotes, setDocNotes] = useState("")

  useEffect(() => {
    if (dToken) {
      getDashData()
    }
  }, [dToken])

  return dashData && (
    <div className='m-5 font-sans'>

      {/* KPI Cards */}
      <div className='flex flex-wrap gap-3'>
        <div className='flex items-center gap-2 bg-white p-4 min-w-52 rounded border-2 border-gray-100 cursor-pointer hover:scale-105 transition-all shadow-sm'>
          <img className='w-14' src={assets.earning_icon} alt="" />
          <div>
            <p className='text-xl font-semibold text-gray-600'>{currency} {dashData.earnings}</p>
            <p className='text-gray-400 text-sm'>Earnings</p>
          </div>
        </div>
        <div className='flex items-center gap-2 bg-white p-4 min-w-52 rounded border-2 border-gray-100 cursor-pointer hover:scale-105 transition-all shadow-sm'>
          <img className='w-14' src={assets.appointments_icon} alt="" />
          <div>
            <p className='text-xl font-semibold text-gray-600'>{dashData.appointments}</p>
            <p className='text-gray-400 text-sm'>Appointments</p>
          </div>
        </div>
        <div className='flex items-center gap-2 bg-white p-4 min-w-52 rounded border-2 border-gray-100 cursor-pointer hover:scale-105 transition-all shadow-sm'>
          <img className='w-14' src={assets.patients_icon} alt="" />
          <div>
            <p className='text-xl font-semibold text-gray-600'>{dashData.patients}</p>
            <p className='text-gray-400 text-sm'>Patients</p>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8'>
        
        {/* Earnings & Appointments Trend */}
        <div className='bg-white p-6 rounded-lg border-2 border-gray-100 shadow-sm'>
          <h3 className='text-base font-semibold text-gray-800 mb-4'>Earnings & Appointments Trend (Last 6 Months)</h3>
          <div className='h-72'>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dashData.appointmentsByMonth} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorApp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#5f6FFF" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#5f6FFF" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorEarn" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: '#9CA3AF', fontSize: 11 }} />
                <YAxis yAxisId="left" tickLine={false} axisLine={false} tick={{ fill: '#9CA3AF', fontSize: 11 }} />
                <YAxis yAxisId="right" orientation="right" tickLine={false} axisLine={false} tick={{ fill: '#9CA3AF', fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }} />
                <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                <Area yAxisId="left" type="monotone" dataKey="appointments" stroke="#5f6FFF" fillOpacity={1} fill="url(#colorApp)" name="Appointments" strokeWidth={2} />
                <Area yAxisId="right" type="monotone" dataKey="earnings" stroke="#10B981" fillOpacity={1} fill="url(#colorEarn)" name={`Earnings (${currency})`} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Appointment Status Overview */}
        <div className='bg-white p-6 rounded-lg border-2 border-gray-100 shadow-sm'>
          <h3 className='text-base font-semibold text-gray-800 mb-4'>Appointment Status Overview</h3>
          <div className='h-72'>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  {
                    name: 'Bookings Status',
                    Completed: dashData.appointmentStatus?.completed || 0,
                    Pending: dashData.appointmentStatus?.pending || 0,
                    Cancelled: dashData.appointmentStatus?.cancelled || 0,
                  }
                ]}
                barSize={50}
                margin={{ top: 20, right: 10, left: -20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: 8 }} />
                <Legend iconType="rect" />
                <Bar dataKey="Completed" fill={STATUS_COLORS.completed} radius={[4, 4, 0, 0]} />
                <Bar dataKey="Pending" fill={STATUS_COLORS.pending} radius={[4, 4, 0, 0]} />
                <Bar dataKey="Cancelled" fill={STATUS_COLORS.cancelled} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Latest Bookings Table */}
      <div className='bg-white rounded-lg border-2 border-gray-100 mt-8 shadow-sm'>
        <div className='flex items-center gap-2.5 px-4 py-4 rounded-t border-b'>
          <img src={assets.list_icon} alt="" />
          <p className='font-semibold text-gray-800'>Latest Bookings</p>
        </div>

        <div className='pt-2'>
          {dashData.latestAppointments.slice(0, 5).map((item, index) => (
            <div className='flex items-center px-6 py-3.5 gap-3 hover:bg-gray-50 border-b last:border-b-0 border-gray-100' key={index}>
              <img className='rounded-full w-10 h-10 object-cover border' src={item.userData.image} alt="" />
              <div className='flex-1 text-sm'>
                <p className='text-gray-800 font-medium'>{item.userData.name}</p>
                <p className='text-gray-500 text-xs mt-0.5'>Booking on {slotDateFormat(item.slotDate)}</p>
              </div>
              {item.cancelled
                ? <p className='text-red-400 text-xs font-semibold px-2 py-1 bg-red-50 rounded-full border border-red-100'>Cancelled</p>
                : item.isCompleted
                  ? <p className='text-green-500 text-xs font-semibold px-2 py-1 bg-green-50 rounded-full border border-green-100'>Completed</p>
                  : <div className='flex items-center gap-2'>
                    <img onClick={() => cancelAppointment(item._id)} className='w-9 h-9 p-1.5 hover:bg-red-50 rounded-full border border-gray-150 cursor-pointer transition-all' src={assets.cancel_icon} alt="" />
                    <img onClick={() => setActiveCompletionId(item._id)} className='w-9 h-9 p-1.5 hover:bg-green-50 rounded-full border border-gray-150 cursor-pointer transition-all' src={assets.tick_icon} alt="" />
                  </div>
              }
            </div>
          ))}
        </div>
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

export default DoctorDashboard