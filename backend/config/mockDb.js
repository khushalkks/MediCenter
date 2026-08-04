import fs from "fs";
import path from "path";
import bcrypt from "bcrypt";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_FILE = path.join(__dirname, "../mockDb.json");

// Helper to check/update field select filter mock
const addSelectChain = (result) => {
  if (result && typeof result === "object") {
    result.select = function() { return this; };
  }
  return result;
};

class MockDatabase {
  constructor() {
    this.data = { doctors: [], users: [], appointments: [] };
    this.initialized = false;
  }

  init() {
    if (this.initialized) return;

    if (fs.existsSync(DB_FILE)) {
      try {
        this.data = JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
        this.initialized = true;
        console.log("📂 Local mock database loaded successfully from mockDb.json");
        return;
      } catch (err) {
        console.error("⚠️ Failed to parse mockDb.json, re-initializing:", err.message);
      }
    }

    // Seed mock data if database doesn't exist
    console.log("🌱 Initializing and seeding local mock database...");
    
    const docPasswordHash = bcrypt.hashSync("Doctor@123", 10);
    const userPasswordHash = bcrypt.hashSync("User@123", 10);

    const initialDoctors = [
      { _id: "doc1", name: "Dr. Richard James",      email: "richard.james@wellora.com",      speciality: "General physician", degree: "MBBS", experience: "4 Years", fees: 500,  image: "https://randomuser.me/api/portraits/men/1.jpg",    address: { line1: "17th Cross, Richmond", line2: "Circle, Ring Road, London" }, password: docPasswordHash, available: true, slots_booked: {}, date: Date.now(), about: "A highly dedicated and compassionate physician with years of experience." },
      { _id: "doc2", name: "Dr. Emily Larson",       email: "emily.larson@wellora.com",       speciality: "Gynecologist",      degree: "MBBS", experience: "3 Years", fees: 600,  image: "https://randomuser.me/api/portraits/women/2.jpg",  address: { line1: "27th Cross, Richmond", line2: "Circle, Ring Road, London" }, password: docPasswordHash, available: true, slots_booked: {}, date: Date.now(), about: "Focused on preventive medicine, early diagnosis, and effective treatment." },
      { _id: "doc3", name: "Dr. Sarah Patel",        email: "sarah.patel@wellora.com",        speciality: "Dermatologist",     degree: "MBBS", experience: "1 Years", fees: 300,  image: "https://randomuser.me/api/portraits/women/3.jpg",  address: { line1: "37th Cross, Richmond", line2: "Circle, Ring Road, London" }, password: docPasswordHash, available: true, slots_booked: {}, date: Date.now(), about: "Delivering comprehensive medical skin care and aesthetics." },
      { _id: "doc4", name: "Dr. Christopher Lee",    email: "christopher.lee@wellora.com",    speciality: "Pediatricians",     degree: "MBBS", experience: "2 Years", fees: 400,  image: "https://randomuser.me/api/portraits/men/4.jpg",    address: { line1: "47th Cross, Richmond", line2: "Circle, Ring Road, London" }, password: docPasswordHash, available: true, slots_booked: {}, date: Date.now(), about: "Compassionate child healthcare and pediatric consulting." },
      { _id: "doc5", name: "Dr. Jennifer Garcia",    email: "jennifer.garcia@wellora.com",    speciality: "Neurologist",       degree: "MBBS", experience: "4 Years", fees: 500,  image: "https://randomuser.me/api/portraits/women/5.jpg",  address: { line1: "57th Cross, Richmond", line2: "Circle, Ring Road, London" }, password: docPasswordHash, available: true, slots_booked: {}, date: Date.now(), about: "Specialist in comprehensive neurological diagnoses." },
      { _id: "doc6", name: "Dr. Andrew Williams",    email: "andrew.williams@wellora.com",    speciality: "Neurologist",       degree: "MBBS", experience: "4 Years", fees: 500,  image: "https://randomuser.me/api/portraits/men/6.jpg",    address: { line1: "57th Cross, Richmond", line2: "Circle, Ring Road, London" }, password: docPasswordHash, available: true, slots_booked: {}, date: Date.now(), about: "Dedicated to general neurology care and treatment." },
      { _id: "doc7", name: "Dr. Christopher Davis",  email: "christopher.davis@wellora.com",  speciality: "General physician", degree: "MBBS", experience: "4 Years", fees: 500,  image: "https://randomuser.me/api/portraits/men/7.jpg",    address: { line1: "17th Cross, Richmond", line2: "Circle, Ring Road, London" }, password: docPasswordHash, available: true, slots_booked: {}, date: Date.now(), about: "Family wellness and general practice." },
      { _id: "doc8", name: "Dr. Timothy White",      email: "timothy.white@wellora.com",      speciality: "Gynecologist",      degree: "MBBS", experience: "3 Years", fees: 600,  image: "https://randomuser.me/api/portraits/men/8.jpg",    address: { line1: "27th Cross, Richmond", line2: "Circle, Ring Road, London" }, password: docPasswordHash, available: true, slots_booked: {}, date: Date.now(), about: "Caring for women's reproductive health and wellness." }
    ];

    const initialUsers = [
      {
        _id: "user1",
        name: "Jane Doe",
        email: "user@wellora.com",
        password: userPasswordHash,
        phone: "9876543210",
        address: { line1: "123 Main St", line2: "Apartment 4B" },
        gender: "Female",
        dob: "1995-08-12",
        image: "https://randomuser.me/api/portraits/women/10.jpg"
      }
    ];

    const initialAppointments = [
      {
        _id: "app1",
        userId: "user1",
        docId: "doc1",
        slotDate: "2026-08-04",
        slotTime: "10:00 AM",
        userData: { name: "Jane Doe", email: "user@wellora.com" },
        docData: { name: "Dr. Richard James", speciality: "General physician", fees: 500 },
        amount: 500,
        date: Date.now() - 86400000, // Yesterday
        cancelled: false,
        payment: true,
        isCompleted: true,
        docNotes: "Patient reported minor fatigue. Advised hydration and multi-vitamins.",
        followUpRecommendation: { isActionable: true, timeFrameDays: 14, urgency: "Low", rationale: "To check energy recovery.", recommendedSpeciality: "General physician" }
      },
      {
        _id: "app2",
        userId: "user1",
        docId: "doc2",
        slotDate: "2026-08-05",
        slotTime: "11:30 AM",
        userData: { name: "Jane Doe", email: "user@wellora.com" },
        docData: { name: "Dr. Emily Larson", speciality: "Gynecologist", fees: 600 },
        amount: 600,
        date: Date.now(), // Today
        cancelled: false,
        payment: true,
        isCompleted: false,
        docNotes: "",
        followUpRecommendation: null
      },
      {
        _id: "app3",
        userId: "user1",
        docId: "doc3",
        slotDate: "2026-08-06",
        slotTime: "02:00 PM",
        userData: { name: "Jane Doe", email: "user@wellora.com" },
        docData: { name: "Dr. Sarah Patel", speciality: "Dermatologist", fees: 300 },
        amount: 300,
        date: Date.now() + 86400000, // Tomorrow
        cancelled: true,
        payment: false,
        isCompleted: false,
        docNotes: "",
        followUpRecommendation: null
      }
    ];

    this.data = {
      doctors: initialDoctors,
      users: initialUsers,
      appointments: initialAppointments
    };

    this.saveAll();
    this.initialized = true;
  }

  saveAll() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), "utf8");
    } catch (err) {
      console.error("❌ Failed to write to mockDb.json:", err.message);
    }
  }

  getCollection(modelName) {
    this.init();
    const key = modelName.toLowerCase() + "s";
    if (!this.data[key]) {
      this.data[key] = [];
    }
    return this.data[key];
  }

  find(modelName, query = {}) {
    const list = this.getCollection(modelName);
    const result = list.filter(item => {
      for (const k in query) {
        // Query support for basic matching
        if (query[k] !== undefined && item[k] !== query[k]) {
          return false;
        }
      }
      return true;
    }).map(item => ({ ...item }));

    return addSelectChain(result);
  }

  findOne(modelName, query = {}) {
    const list = this.getCollection(modelName);
    const matched = list.find(item => {
      for (const k in query) {
        if (query[k] !== undefined && item[k] !== query[k]) {
          return false;
        }
      }
      return true;
    });

    return matched ? addSelectChain({ ...matched }) : null;
  }

  findById(modelName, id) {
    const list = this.getCollection(modelName);
    const matched = list.find(item => item._id === id || String(item._id) === String(id));
    return matched ? addSelectChain({ ...matched }) : null;
  }

  findByIdAndUpdate(modelName, id, update) {
    const list = this.getCollection(modelName);
    const index = list.findIndex(item => item._id === id || String(item._id) === String(id));
    if (index === -1) return null;

    const currentItem = list[index];
    const updatedItem = { ...currentItem, ...update };
    
    // Address updates inside Address object nested checks if needed
    if (update.address && typeof update.address === "object") {
      updatedItem.address = { ...currentItem.address, ...update.address };
    }

    list[index] = updatedItem;
    this.saveAll();
    return addSelectChain({ ...updatedItem });
  }

  save(modelName, docData) {
    const list = this.getCollection(modelName);
    const doc = { ...docData };

    if (!doc._id) {
      doc._id = modelName.toLowerCase().substring(0, 3) + "_" + Math.random().toString(36).substr(2, 9);
    }

    // Remove methods
    delete doc.save;
    delete doc.select;

    // Check unique email constraint if applicable
    if (doc.email && (modelName === "doctor" || modelName === "user")) {
      const exists = list.some(item => item.email === doc.email && item._id !== doc._id);
      if (exists) {
        throw new Error(`${modelName} with email ${doc.email} already exists.`);
      }
    }

    const index = list.findIndex(item => item._id === doc._id);
    if (index > -1) {
      list[index] = doc;
    } else {
      list.push(doc);
    }

    this.saveAll();
    return addSelectChain({ ...doc });
  }
}

const mockDb = new MockDatabase();
export default mockDb;
