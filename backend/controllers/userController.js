import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import validator from "validator";
import userModel from "../models/userModel.js";
import { OpenAI } from "openai";
import fs from "fs";
import { retrieveMedicalContext } from "../utils/ragRetriever.js";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const { PDFParse } = require("pdf-parse");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1",
  defaultHeaders: {
    "HTTP-Referer": "http://localhost:5173",
    "X-Title": "MediCare Medical Assistant",
  },
});
import doctorModel from "../models/doctorModel.js";
import appointmentModel from "../models/appointmentModel.js";
import { v2 as cloudinary } from 'cloudinary'
import stripe from "stripe";
import razorpay from 'razorpay';

// Gateway Initialize
const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY)
const razorpayInstance = new razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
})

// API to register user
const registerUser = async (req, res) => {

    try {
        const { name, email, password } = req.body;

        // checking for all data to register user
        if (!name || !email || !password) {
            return res.json({ success: false, message: 'Missing Details' })
        }

        // validating email format
        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Please enter a valid email" })
        }

        // validating strong password
        if (password.length < 8) {
            return res.json({ success: false, message: "Please enter a strong password" })
        }

        // checking if user already exists
        const exists = await userModel.findOne({ email })
        if (exists) {
            return res.json({ success: false, message: "User already exists" })
        }

        // hashing user password
        const salt = await bcrypt.genSalt(10); // the more no. round the more time it will take
        const hashedPassword = await bcrypt.hash(password, salt)

        const userData = {
            name,
            email,
            password: hashedPassword,
        }

        const newUser = new userModel(userData)
        const user = await newUser.save()
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)

        res.json({ success: true, token })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to login user
const loginUser = async (req, res) => {

    try {
        const { email, password } = req.body;
        const user = await userModel.findOne({ email })

        if (!user) {
            return res.json({ success: false, message: "User does not exist" })
        }

        const isMatch = await bcrypt.compare(password, user.password)

        if (isMatch) {
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)
            res.json({ success: true, token })
        }
        else {
            res.json({ success: false, message: "Invalid credentials" })
        }
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to get user profile data
const getProfile = async (req, res) => {

    try {
        const { userId } = req.body
        const userData = await userModel.findById(userId).select('-password')

        if (!userData) {
            return res.json({ success: false, message: 'User not found' })
        }

        res.json({ success: true, userData })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to update user profile
const updateProfile = async (req, res) => {

    try {

        const { userId, name, phone, address, dob, gender } = req.body
        const imageFile = req.file

        if (!name || !phone || !dob || !gender) {
            return res.json({ success: false, message: "Data Missing" })
        }

        await userModel.findByIdAndUpdate(userId, { name, phone, address: JSON.parse(address), dob, gender })

        if (imageFile) {

            // upload image to cloudinary
            const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" })
            const imageURL = imageUpload.secure_url

            await userModel.findByIdAndUpdate(userId, { image: imageURL })
        }

        res.json({ success: true, message: 'Profile Updated' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to book appointment 
const bookAppointment = async (req, res) => {

    try {

        const { userId, docId, slotDate, slotTime } = req.body
        const docData = await doctorModel.findById(docId).select("-password")

        if (!docData) {
            return res.json({ success: false, message: 'Doctor not found' })
        }

        if (!docData.available) {
            return res.json({ success: false, message: 'Doctor Not Available' })
        }

        let slots_booked = docData.slots_booked

        // checking for slot availablity 
        if (slots_booked[slotDate]) {
            if (slots_booked[slotDate].includes(slotTime)) {
                return res.json({ success: false, message: 'Slot Not Available' })
            }
            else {
                slots_booked[slotDate].push(slotTime)
            }
        } else {
            slots_booked[slotDate] = []
            slots_booked[slotDate].push(slotTime)
        }

        const userData = await userModel.findById(userId).select("-password")

        if (!userData) {
            return res.json({ success: false, message: 'User not found' })
        }

        delete docData.slots_booked

        const appointmentData = {
            userId,
            docId,
            userData,
            docData,
            amount: docData.fees,
            slotTime,
            slotDate,
            date: Date.now()
        }

        const newAppointment = new appointmentModel(appointmentData)
        await newAppointment.save()

        // save new slots data in docData
        await doctorModel.findByIdAndUpdate(docId, { slots_booked })

        res.json({ success: true, message: 'Appointment Booked' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }

}

// API to cancel appointment
const cancelAppointment = async (req, res) => {
    try {

        const { userId, appointmentId } = req.body
        const appointmentData = await appointmentModel.findById(appointmentId)

        if (!appointmentData) {
            return res.json({ success: false, message: 'Appointment not found' })
        }

        // verify appointment user 
        if (appointmentData.userId !== userId) {
            return res.json({ success: false, message: 'Unauthorized action' })
        }

        await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true })

        // releasing doctor slot 
        const { docId, slotDate, slotTime } = appointmentData

        const doctorData = await doctorModel.findById(docId)

        let slots_booked = doctorData.slots_booked

        slots_booked[slotDate] = slots_booked[slotDate].filter(e => e !== slotTime)

        await doctorModel.findByIdAndUpdate(docId, { slots_booked })

        res.json({ success: true, message: 'Appointment Cancelled' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to get user appointments for frontend my-appointments page
const listAppointment = async (req, res) => {
    try {

        const { userId } = req.body
        const appointments = await appointmentModel.find({ userId })

        res.json({ success: true, appointments })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to make payment of appointment using razorpay
const paymentRazorpay = async (req, res) => {
    try {

        const { appointmentId } = req.body
        const appointmentData = await appointmentModel.findById(appointmentId)

        if (!appointmentData || appointmentData.cancelled) {
            return res.json({ success: false, message: 'Appointment Cancelled or not found' })
        }

        // creating options for razorpay payment
        const options = {
            amount: appointmentData.amount * 100,
            currency: process.env.CURRENCY,
            receipt: appointmentId,
        }

        // creation of an order
        const order = await razorpayInstance.orders.create(options)

        res.json({ success: true, order })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to verify payment of razorpay
const verifyRazorpay = async (req, res) => {
    try {
        const { razorpay_order_id } = req.body
        const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id)

        if (orderInfo.status === 'paid') {
            await appointmentModel.findByIdAndUpdate(orderInfo.receipt, { payment: true })
            res.json({ success: true, message: "Payment Successful" })
        }
        else {
            res.json({ success: false, message: 'Payment Failed' })
        }
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to make payment of appointment using Stripe
const paymentStripe = async (req, res) => {
    try {

        const { appointmentId } = req.body
        const { origin } = req.headers

        const appointmentData = await appointmentModel.findById(appointmentId)

        if (!appointmentData || appointmentData.cancelled) {
            return res.json({ success: false, message: 'Appointment Cancelled or not found' })
        }

        const currency = process.env.CURRENCY.toLocaleLowerCase()

        const line_items = [{
            price_data: {
                currency,
                product_data: {
                    name: "Appointment Fees"
                },
                unit_amount: appointmentData.amount * 100
            },
            quantity: 1
        }]

        const session = await stripeInstance.checkout.sessions.create({
            success_url: `${origin}/verify?success=true&appointmentId=${appointmentData._id}`,
            cancel_url: `${origin}/verify?success=false&appointmentId=${appointmentData._id}`,
            line_items: line_items,
            mode: 'payment',
        })

        res.json({ success: true, session_url: session.url });

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

const verifyStripe = async (req, res) => {
    try {

        const { appointmentId, success } = req.body

        if (success === "true") {
            await appointmentModel.findByIdAndUpdate(appointmentId, { payment: true })
            return res.json({ success: true, message: 'Payment Successful' })
        }

        res.json({ success: false, message: 'Payment Failed' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }

}

// API to analyze and summarize medical report (PDF or Image)
const summarizeReport = async (req, res) => {
    try {
        const file = req.file;
        if (!file) {
            return res.json({ success: false, message: "No file uploaded" });
        }

        const mimeType = file.mimetype;
        const filePath = file.path;
        let analysisResult = "";

        if (mimeType === "application/pdf") {
            // PDF: Parse text contents using pdf-parse
            const dataBuffer = fs.readFileSync(filePath);
            const uint8Array = new Uint8Array(dataBuffer);
            const parser = new PDFParse(uint8Array);
            const pdfData = await parser.getText();
            const textContent = pdfData.text;

            if (!textContent || textContent.trim().length === 0) {
                fs.unlinkSync(filePath);
                return res.json({ success: false, message: "Could not extract text from the PDF report. Make sure it is not scanned/empty." });
            }

            // RAG: Retrieve matching medical guidelines
            const { contextString } = await retrieveMedicalContext(textContent, openai);

            const prompt = `You are MediCare's expert medical analyst. Analyze the following medical report text and provide a structured explanation in simple terms.
Highlight any values that are abnormal (e.g. out of reference ranges) or concerning, explain complex medical jargon, and state which doctor specialty the patient should consult.

Cross-reference the findings with the retrieved verified clinical guidelines context below. For any parameters found in the report that match these guidelines, cite them in the 'clinical_references' array.

${contextString}

Return your response in a clean JSON format with these exact keys:
{
  "key_findings": "Summary of primary findings in simple terms.",
  "abnormal_levels": "List of any out-of-bound levels or warning metrics. If none, write 'None'.",
  "terms_explained": "Simple layperson definitions for complex jargon present in the report.",
  "recommended_specialist": "Specific specialist (e.g., Cardiologist, Gynecologist, Neurologist) and why.",
  "clinical_references": [
    {
      "parameter": "Parameter name (e.g., Hemoglobin)",
      "ref_range": "Standard reference range from the guidelines",
      "significance": "Clinical significance / warning indicators",
      "source_name": "Source database (e.g., MedlinePlus (NIH))",
      "source_url": "Source link URL"
    }
  ]
}

Report Text:
${textContent}`;

            const response = await openai.chat.completions.create({
                model: "openai/gpt-4o-mini",
                messages: [{ role: "user", content: prompt }],
                response_format: { type: "json_object" }
            });

            analysisResult = JSON.parse(response.choices[0].message.content);

        } else if (mimeType.startsWith("image/")) {
            // Image: Send to Vision API
            const imageBuffer = fs.readFileSync(filePath);
            const base64Image = imageBuffer.toString("base64");
            const dataUrl = `data:${mimeType};base64,${base64Image}`;

            // RAG: For images, inject the complete clinical guidelines dataset to cross-reference
            const { contextString } = await retrieveMedicalContext(
                "hemoglobin cholesterol glucose hba1c wbc crp platelet tsh creatinine",
                openai
            );

            const systemPrompt = `You are MediCare's expert medical analyst. Analyze the uploaded medical report image and provide a structured explanation in simple terms.
Highlight any values that are abnormal (e.g. out of reference ranges) or concerning, explain complex medical jargon, and state which doctor specialty the patient should consult.

Cross-reference the findings with the verified official clinical guidelines below. For any parameters found in the image that match these guidelines, cite them in the 'clinical_references' array.

${contextString}

Return your response in a clean JSON format with these exact keys:
{
  "key_findings": "Summary of primary findings in simple terms.",
  "abnormal_levels": "List of any out-of-bound levels or warning metrics. If none, write 'None'.",
  "terms_explained": "Simple layperson definitions for complex jargon present in the report.",
  "recommended_specialist": "Specific specialist (e.g., Cardiologist, Gynecologist, Neurologist) and why.",
  "clinical_references": [
    {
      "parameter": "Parameter name (e.g., Hemoglobin)",
      "ref_range": "Standard reference range from the guidelines",
      "significance": "Clinical significance / warning indicators",
      "source_name": "Source database (e.g., MedlinePlus (NIH))",
      "source_url": "Source link URL"
    }
  ]
}`;

            const response = await openai.chat.completions.create({
                model: "openai/gpt-4o-mini",
                messages: [
                    {
                        role: "user",
                        content: [
                            { type: "text", text: systemPrompt },
                            {
                                type: "image_url",
                                image_url: {
                                    url: dataUrl
                                }
                            }
                        ]
                    }
                ],
                response_format: { type: "json_object" }
            });

            analysisResult = JSON.parse(response.choices[0].message.content);

        } else {
            fs.unlinkSync(filePath);
            return res.json({ success: false, message: "Unsupported file type. Only PDF, PNG, JPG, and JPEG are supported." });
        }

        // Clean up uploaded file
        fs.unlinkSync(filePath);

        res.json({ success: true, analysis: analysisResult });

    } catch (error) {
        console.error("Report Summarization Error:", error);
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        res.json({ success: false, message: error.message });
    }
};

export {
    loginUser,
    registerUser,
    getProfile,
    updateProfile,
    bookAppointment,
    listAppointment,
    cancelAppointment,
    paymentRazorpay,
    verifyRazorpay,
    paymentStripe,
    verifyStripe,
    summarizeReport
}