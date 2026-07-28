import React, { useContext, useEffect } from 'react'
import { assets } from '../../assets/assets'
import { AdminContext } from '../../context/AdminContext'
import { AppContext } from '../../context/AppContext'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, BarChart, Bar, Legend } from 'recharts';

const COLORS = ['#5f6FFF', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF19A3'];
const STATUS_COLORS = {
  completed: '#10B981',
  cancelled: '#EF4444',
  pending: '#F59E0B'
};

const Dashboard = () => {

  const { aToken, getDashData, cancelAppointment, dashData } = useContext(AdminContext)
  const { slotDateFormat } = useContext(AppContext)

  useEffect(() => {
    if (aToken) {
      getDashData()
    }
  }, [aToken])

  return dashData && (
    <div className='m-5 font-sans'>

      {/* KPI Cards */}
      <div className='flex flex-wrap gap-3'>
        <div className='flex items-center gap-2 bg-white p-4 min-w-52 rounded border-2 border-gray-100 cursor-pointer hover:scale-105 transition-all shadow-sm'>
          <img className='w-14' src={assets.doctor_icon} alt="" />
          <div>
            <p className='text-xl font-semibold text-gray-600'>{dashData.doctors}</p>
            <p className='text-gray-400 text-sm'>Doctors</p>
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

      {/* Interactive Charts Section */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8'>
        
        {/* Appointments & Revenue Trend */}
        <div className='bg-white p-6 rounded-lg border-2 border-gray-100 shadow-sm'>
          <h3 className='text-base font-semibold text-gray-800 mb-4'>Appointments & Revenue Trend (Last 6 Months)</h3>
          <div className='h-72'>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dashData.appointmentsByMonth} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorApp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#5f6FFF" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#5f6FFF" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00C49F" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#00C49F" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: '#9CA3AF', fontSize: 11 }} />
                <YAxis yAxisId="left" tickLine={false} axisLine={false} tick={{ fill: '#9CA3AF', fontSize: 11 }} />
                <YAxis yAxisId="right" orientation="right" tickLine={false} axisLine={false} tick={{ fill: '#9CA3AF', fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }} />
                <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                <Area yAxisId="left" type="monotone" dataKey="appointments" stroke="#5f6FFF" fillOpacity={1} fill="url(#colorApp)" name="Appointments" strokeWidth={2} />
                <Area yAxisId="right" type="monotone" dataKey="revenue" stroke="#00C49F" fillOpacity={1} fill="url(#colorRev)" name="Revenue (₹)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Specialty Distribution (Pie Chart) */}
        <div className='bg-white p-6 rounded-lg border-2 border-gray-100 shadow-sm flex flex-col'>
          <h3 className='text-base font-semibold text-gray-800 mb-4'>Specialty Distribution</h3>
          <div className='h-72 flex-1 relative'>
            {dashData.specialityDistribution && dashData.specialityDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dashData.specialityDistribution}
                    cx="50%"
                    cy="45%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="count"
                    nameKey="speciality"
                  >
                    {dashData.specialityDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E5E7EB' }} />
                  <Legend layout="horizontal" verticalAlign="bottom" align="center" iconType="circle" wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400 text-sm">No specialty data available</div>
            )}
          </div>
        </div>

        {/* Appointment Status Bar Chart */}
        <div className='bg-white p-6 rounded-lg border-2 border-gray-100 shadow-sm lg:col-span-2'>
          <h3 className='text-base font-semibold text-gray-800 mb-4'>Appointment Status Overview</h3>
          <div className='h-60'>
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
                barSize={60}
                margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
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
              <img className='rounded-full w-10 h-10 object-cover border' src={item.docData.image} alt="" />
              <div className='flex-1 text-sm'>
                <p className='text-gray-800 font-medium'>{item.docData.name}</p>
                <p className='text-gray-500 text-xs mt-0.5'>Booking on {slotDateFormat(item.slotDate)}</p>
              </div>
              {item.cancelled ? <p className='text-red-400 text-xs font-semibold px-2 py-1 bg-red-50 rounded-full border border-red-100'>Cancelled</p> : item.isCompleted ? <p className='text-green-500 text-xs font-semibold px-2 py-1 bg-green-50 rounded-full border border-green-100'>Completed</p> : <img onClick={() => cancelAppointment(item._id)} className='w-10 h-10 p-2 hover:bg-red-50 rounded-full border border-gray-150 cursor-pointer transition-all' src={assets.cancel_icon} alt="" />}
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}

export default Dashboard