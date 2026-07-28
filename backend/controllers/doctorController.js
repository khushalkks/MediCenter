import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import doctorModel from "../models/doctorModel.js";
import appointmentModel from "../models/appointmentModel.js";
import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1",
  defaultHeaders: {
    "HTTP-Referer": "http://localhost:5173",
    "X-Title": "MediCare Medical Assistant",
  },
});

// API for doctor Login 
const loginDoctor = async (req, res) => {

    try {

        const { email, password } = req.body
        const user = await doctorModel.findOne({ email })

        if (!user) {
            return res.json({ success: false, message: "Invalid credentials" })
        }

        const isMatch = await bcrypt.compare(password, user.password)

        if (isMatch) {
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)
            res.json({ success: true, token })
        } else {
            res.json({ success: false, message: "Invalid credentials" })
        }


    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to get doctor appointments for doctor panel
const appointmentsDoctor = async (req, res) => {
    try {

        const { docId } = req.body
        const appointments = await appointmentModel.find({ docId })

        res.json({ success: true, appointments })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to cancel appointment for doctor panel
const appointmentCancel = async (req, res) => {
    try {

        const { docId, appointmentId } = req.body

        const appointmentData = await appointmentModel.findById(appointmentId)
        if (appointmentData && appointmentData.docId === docId) {
            await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true })
            return res.json({ success: true, message: 'Appointment Cancelled' })
        }

        res.json({ success: false, message: 'Appointment Cancelled' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }

}

// API to mark appointment completed for doctor panel
const appointmentComplete = async (req, res) => {
    try {

        const { docId, appointmentId, docNotes } = req.body

        const appointmentData = await appointmentModel.findById(appointmentId)
        if (appointmentData && appointmentData.docId === docId) {
            
            let followUpRecommendation = null;

            if (docNotes && docNotes.trim().length > 0) {
                try {
                    const prompt = `You are a clinical coordinator agent. Read the following doctor's diagnosis/prescription notes and determine if a follow-up appointment is recommended.
Extract standard parameters in a clean JSON format.

Notes: "${docNotes}"

Return your response in a clean JSON format with these exact keys:
{
  "isActionable": true/false (true if doctor explicitly or implicitly advises a follow-up, check-up, review, or testing in the future),
  "timeFrameDays": number (estimate the number of days for the follow-up. E.g. "next week" = 7, "2 weeks" = 14, "a month" = 30. If no timeframe mentioned, default to 14. Value must be a number),
  "urgency": "Low" / "Medium" / "High",
  "rationale": "One simple sentence explaining why the follow-up is needed (e.g. 'To monitor blood pressure levels')",
  "recommendedSpeciality": "Name of specialty (e.g. General physician, Dermatologist, Cardiologist)"
}`;

                    const aiResponse = await openai.chat.completions.create({
                        model: "openai/gpt-4o-mini",
                        messages: [{ role: "user", content: prompt }],
                        response_format: { type: "json_object" }
                    });

                    followUpRecommendation = JSON.parse(aiResponse.choices[0].message.content);
                    console.log("🤖 AI Agent extracted follow-up recommendations:", followUpRecommendation);
                } catch (aiError) {
                    console.error("⚠️ AI Follow-up extraction failed:", aiError.message);
                }
            }

            await appointmentModel.findByIdAndUpdate(appointmentId, { 
                isCompleted: true,
                docNotes: docNotes || "",
                followUpRecommendation
            });
            
            return res.json({ success: true, message: 'Appointment Completed' })
        }

        res.json({ success: false, message: 'Appointment Cancelled' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }

}

// API to get all doctors list for Frontend
const doctorList = async (req, res) => {
    try {

        const doctors = await doctorModel.find({}).select(['-password', '-email'])
        res.json({ success: true, doctors })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }

}

// API to change doctor availablity for Admin and Doctor Panel
const changeAvailablity = async (req, res) => {
    try {

        const { docId } = req.body

        const docData = await doctorModel.findById(docId)
        await doctorModel.findByIdAndUpdate(docId, { available: !docData.available })
        res.json({ success: true, message: 'Availablity Changed' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to get doctor profile for  Doctor Panel
const doctorProfile = async (req, res) => {
    try {

        const { docId } = req.body
        const profileData = await doctorModel.findById(docId).select('-password')

        res.json({ success: true, profileData })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to update doctor profile data from  Doctor Panel
const updateDoctorProfile = async (req, res) => {
    try {

        const { docId, fees, address, available } = req.body

        await doctorModel.findByIdAndUpdate(docId, { fees, address, available })

        res.json({ success: true, message: 'Profile Updated' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to get dashboard data for doctor panel
const doctorDashboard = async (req, res) => {
    try {

        const { docId } = req.body

        const appointments = await appointmentModel.find({ docId })

        let earnings = 0

        appointments.map((item) => {
            if (item.isCompleted || item.payment) {
                earnings += item.amount
            }
        })

        let patients = []

        appointments.map((item) => {
            if (!patients.includes(item.userId)) {
                patients.push(item.userId)
            }
        })

        // Generate monthly trends for last 6 months
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const monthlyStatsMap = {};
        
        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const monthName = months[d.getMonth()];
            const year = d.getFullYear();
            const key = `${monthName} ${year}`;
            monthlyStatsMap[key] = { month: key, appointments: 0, earnings: 0 };
        }

        let completed = 0, cancelled = 0, pending = 0;

        appointments.forEach(app => {
            const appDate = new Date(app.date);
            const monthName = months[appDate.getMonth()];
            const year = appDate.getFullYear();
            const key = `${monthName} ${year}`;
            if (monthlyStatsMap[key]) {
                monthlyStatsMap[key].appointments += 1;
                if (app.isCompleted || app.payment) {
                    monthlyStatsMap[key].earnings += app.amount;
                }
            }

            if (app.cancelled) {
                cancelled++;
            } else if (app.isCompleted) {
                completed++;
            } else {
                pending++;
            }
        });

        const dashData = {
            earnings,
            appointments: appointments.length,
            patients: patients.length,
            latestAppointments: [...appointments].reverse(),
            appointmentsByMonth: Object.values(monthlyStatsMap),
            appointmentStatus: { completed, cancelled, pending }
        }

        res.json({ success: true, dashData })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

export {
    loginDoctor,
    appointmentsDoctor,
    appointmentCancel,
    doctorList,
    changeAvailablity,
    appointmentComplete,
    doctorDashboard,
    doctorProfile,
    updateDoctorProfile
}