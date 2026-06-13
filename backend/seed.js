// Seed script — run with: node seed.js
// This seeds 15 sample doctors into MongoDB

import mongoose from "mongoose";
import bcrypt from "bcrypt";
import "dotenv/config";

const connectDB = async () => {
    await mongoose.connect(process.env.MONGODB_URI, {
        dbName: process.env.DB_NAME || "wellora",
    });
    console.log("✅ MongoDB Connected!");
};

const doctorSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String,
    image: String,
    speciality: String,
    degree: String,
    experience: String,
    about: String,
    available: { type: Boolean, default: true },
    fees: Number,
    slots_booked: { type: Object, default: {} },
    address: Object,
    date: Number,
}, { minimize: false });

const DoctorModel = mongoose.models.doctor || mongoose.model("doctor", doctorSchema);

const ABOUT = "A highly dedicated and compassionate physician with years of experience in delivering comprehensive medical care. Focuses on preventive medicine, early diagnosis, and effective treatment strategies to ensure the best outcomes for patients.";

const doctors = [
    { name: "Dr. Richard James",      email: "richard.james@wellora.com",      speciality: "General physician", degree: "MBBS", experience: "4 Years", fees: 500,  image: "https://randomuser.me/api/portraits/men/1.jpg",    address: { line1: "17th Cross, Richmond", line2: "Circle, Ring Road, London" } },
    { name: "Dr. Emily Larson",       email: "emily.larson@wellora.com",       speciality: "Gynecologist",      degree: "MBBS", experience: "3 Years", fees: 600,  image: "https://randomuser.me/api/portraits/women/2.jpg",  address: { line1: "27th Cross, Richmond", line2: "Circle, Ring Road, London" } },
    { name: "Dr. Sarah Patel",        email: "sarah.patel@wellora.com",        speciality: "Dermatologist",     degree: "MBBS", experience: "1 Years", fees: 300,  image: "https://randomuser.me/api/portraits/women/3.jpg",  address: { line1: "37th Cross, Richmond", line2: "Circle, Ring Road, London" } },
    { name: "Dr. Christopher Lee",    email: "christopher.lee@wellora.com",    speciality: "Pediatricians",     degree: "MBBS", experience: "2 Years", fees: 400,  image: "https://randomuser.me/api/portraits/men/4.jpg",    address: { line1: "47th Cross, Richmond", line2: "Circle, Ring Road, London" } },
    { name: "Dr. Jennifer Garcia",    email: "jennifer.garcia@wellora.com",    speciality: "Neurologist",       degree: "MBBS", experience: "4 Years", fees: 500,  image: "https://randomuser.me/api/portraits/women/5.jpg",  address: { line1: "57th Cross, Richmond", line2: "Circle, Ring Road, London" } },
    { name: "Dr. Andrew Williams",    email: "andrew.williams@wellora.com",    speciality: "Neurologist",       degree: "MBBS", experience: "4 Years", fees: 500,  image: "https://randomuser.me/api/portraits/men/6.jpg",    address: { line1: "57th Cross, Richmond", line2: "Circle, Ring Road, London" } },
    { name: "Dr. Christopher Davis",  email: "christopher.davis@wellora.com",  speciality: "General physician", degree: "MBBS", experience: "4 Years", fees: 500,  image: "https://randomuser.me/api/portraits/men/7.jpg",    address: { line1: "17th Cross, Richmond", line2: "Circle, Ring Road, London" } },
    { name: "Dr. Timothy White",      email: "timothy.white@wellora.com",      speciality: "Gynecologist",      degree: "MBBS", experience: "3 Years", fees: 600,  image: "https://randomuser.me/api/portraits/men/8.jpg",    address: { line1: "27th Cross, Richmond", line2: "Circle, Ring Road, London" } },
    { name: "Dr. Ava Mitchell",       email: "ava.mitchell@wellora.com",       speciality: "Dermatologist",     degree: "MBBS", experience: "1 Years", fees: 300,  image: "https://randomuser.me/api/portraits/women/9.jpg",  address: { line1: "37th Cross, Richmond", line2: "Circle, Ring Road, London" } },
    { name: "Dr. Jeffrey King",       email: "jeffrey.king@wellora.com",       speciality: "Pediatricians",     degree: "MBBS", experience: "2 Years", fees: 400,  image: "https://randomuser.me/api/portraits/men/10.jpg",   address: { line1: "47th Cross, Richmond", line2: "Circle, Ring Road, London" } },
    { name: "Dr. Zoe Kelly",          email: "zoe.kelly@wellora.com",          speciality: "Neurologist",       degree: "MBBS", experience: "4 Years", fees: 500,  image: "https://randomuser.me/api/portraits/women/11.jpg", address: { line1: "57th Cross, Richmond", line2: "Circle, Ring Road, London" } },
    { name: "Dr. Patrick Harris",     email: "patrick.harris@wellora.com",     speciality: "Neurologist",       degree: "MBBS", experience: "4 Years", fees: 500,  image: "https://randomuser.me/api/portraits/men/12.jpg",   address: { line1: "57th Cross, Richmond", line2: "Circle, Ring Road, London" } },
    { name: "Dr. Chloe Evans",        email: "chloe.evans@wellora.com",        speciality: "General physician", degree: "MBBS", experience: "4 Years", fees: 500,  image: "https://randomuser.me/api/portraits/women/13.jpg", address: { line1: "17th Cross, Richmond", line2: "Circle, Ring Road, London" } },
    { name: "Dr. Ryan Martinez",      email: "ryan.martinez@wellora.com",      speciality: "Gynecologist",      degree: "MBBS", experience: "3 Years", fees: 600,  image: "https://randomuser.me/api/portraits/men/14.jpg",   address: { line1: "27th Cross, Richmond", line2: "Circle, Ring Road, London" } },
    { name: "Dr. Amelia Hill",        email: "amelia.hill@wellora.com",        speciality: "Dermatologist",     degree: "MBBS", experience: "1 Years", fees: 300,  image: "https://randomuser.me/api/portraits/women/15.jpg", address: { line1: "37th Cross, Richmond", line2: "Circle, Ring Road, London" } },
];

const seed = async () => {
    await connectDB();

    const hashedPassword = await bcrypt.hash("Doctor@123", 10);

    let added = 0;
    let skipped = 0;

    for (const doc of doctors) {
        const exists = await DoctorModel.findOne({ email: doc.email });
        if (exists) {
            console.log(`⚠️  Skipped (already exists): ${doc.name}`);
            skipped++;
            continue;
        }
        await DoctorModel.create({
            ...doc,
            password: hashedPassword,
            about: ABOUT,
            available: true,
            slots_booked: {},
            date: Date.now(),
        });
        console.log(`✅ Added: ${doc.name}`);
        added++;
    }

    console.log(`\n🎉 Seeding complete! Added: ${added}, Skipped: ${skipped}`);
    process.exit(0);
};

seed().catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
});
