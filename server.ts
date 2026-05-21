import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { DbSchema, CommunityPost, CommunityEvent, DonationCause, DonationRecord } from './src/types.js';

// Derived ES Module variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;
const DB_FILE = path.join(process.cwd(), 'db.json');

app.use(express.json());

// Initialize Database with authentic Hindi & English Janwa Samaj mock data
const initialDb: DbSchema = {
  posts: [
    {
      id: "post_1",
      title: "समाज में बालिकाओं की शिक्षा एवं छात्रवृत्ति के लिए नई पहल",
      content: "प्रिय जणवा बंधुओं, हमारे समाज में बालिकाओं की उच्च शिक्षा को बढ़ावा देने के लिए आगामी सत्र से समाज के स्तर पर 'बालिका शिक्षा प्रोत्साहन योजना' चालू की जा रही है। इसके तहत स्नातक और तकनीकी शिक्षा में प्रवेश लेने वाली जरूरतमंद छात्राओं को समाज के भामाशाहों के सहयोग से उचित आर्थिक मदद और निःशुल्क कोचिंग प्रदान की जाएगी। कृपया अपने आस-पास की बालिकाओं को इसके लिए प्रेरित करें और जागरूक बनाएं। शिक्षा ही हमारे उज्जवल भविष्य की चाबी है।",
      author: "कन्हैयालाल जणवा",
      gotra: "खरोड़",
      village: "पाली",
      date: "2026-05-18",
      category: "शिक्षा",
      likes: 18
    },
    {
      id: "post_2",
      title: "नशामुक्ति अभियान: शादी-विवाह में फिजूलखर्ची और व्यसनों पर रोक",
      content: "जणवा समाज मेवाड़ महासभा के निर्णय अनुसार, समाज के सामूहिक व व्यक्तिगत विवाह समाराहों में फिजूलखर्ची तथा अफीम, डोडा, शराब आदि व्यसनों के प्रयोग पर पूर्ण प्रतिबंध लगाने का संकल्प लिया गया है। इस सामाजिक कुरीति को मिटाने के लिए समाज के युवाओं को आगे आना होगा। यदि हम जागरूक होंगे, तभी हमारी अगली पीढ़ी स्वस्थ और समृद्ध बनेगी। कृपया इस संदेश को जन-जन तक पहुंचाएं।",
      author: "करण जणवा",
      gotra: "मांडोवी",
      village: "चित्तौड़गढ़",
      date: "2026-05-19",
      category: "नशामुक्ति",
      likes: 32
    },
    {
      id: "post_3",
      title: "पर्यावरण बचाओ - पौधारोपण महाभियान की शुरुआत",
      content: "समाज के युवाओं द्वारा आगामी मानसून सत्र में प्रत्येक गाँव और ढाणी में 'कम से कम एक वृक्ष' लगाने की शपथ ली गई है। हमारी सामाजिक जागरूकता टीम हर गाँव में मुफ्त पौधे वितरित करेगी। इस पुनीत कार्य में अपना योगदान देना न भूलें। धरती हरी-भरी रहेगी तो हमारा पशुधन और समाज भी सुखी रहेगा।",
      author: "ओमप्रकाश जणवा",
      gotra: "कुमावत",
      village: "भीलवाड़ा",
      date: "2026-05-20",
      category: "स्वास्थ्य",
      likes: 12
    }
  ],
  events: [
    {
      id: "event_1",
      title: "श्री जणवा समाज स्नेह मिलन एवं सामूहिक विवाह परामर्श बैठक",
      description: "सत्र 2026 के आगामी सामूहिक विवाह आयोजन, समाज की जनगणना और धर्मशाला निर्माण की गति देने के लिए समाज के प्रबुद्ध जनों एवं समस्त संस्थाओं की एक महत्वपूर्ण बैठक आयोजित की जा रही है। बैठक में सभी युवाओं और मातृशक्ति की उपस्थिति सादर प्रार्थनीय है। बैठक के पश्चात सामूहिक भोजन (स्नेह मिलन) का आयोजन रहेगा।",
      date: "2026-06-10",
      time: "प्रातः 10:00 बजे से",
      venue: "श्री जणवा समाज मेवाड़ आसावरा माता धर्मशाला परिसर, चारभुजा मन्दिर हिंगलाज माता मन्दिर देसूरी रोड, बाली पाली (राजस्थान)",
      organizer: "अखिल भारतीय जणवा समाज मेवाड़ विकास महासभा",
      contact: "98290XXXXX",
      category: "बैठक",
      rsvpList: [
        { name: "हरीश जणवा", gotra: "साजला", contact: "9414XXXX12" },
        { name: "श्यामलाल जणवा", gotra: "पोरवा", contact: "9636XXXX88" }
      ]
    },
    {
      id: "event_2",
      title: "जणवा जाग्रति खेल महाकुंभ एवं प्रतिभा सम्मान समारोह",
      description: "युवाओं को खेल से जोड़ने और समाज की उभरती खेल प्रतिभाओं को सम्मानित करने के लिए तीन दिवसीय कबड्डी व वॉलीबॉल प्रतियोगिता का आयोजन किया जा रहा है। इसी समारोह में दसवीं और बारहवीं कक्षा में उत्कृष्ट अंक प्राप्त करने वाले समाज के छात्र-छात्राओं को विशेष मेडल व नकद पुरस्कार से सम्मानित किया जाएगा।",
      date: "2026-06-25",
      time: "सुबह 08:00 बजे",
      venue: "राजकीय खेल स्टेडियम, कपासन",
      organizer: "जणवा युवा शक्ति क्लब",
      contact: "97850XXXXX",
      category: "खेलकूद",
      rsvpList: [
        { name: "दिनेश जणवा", gotra: "लोल", contact: "9928XXXX99" }
      ]
    }
  ],
  causes: [
    {
      id: "cause_1",
      title: "जणवा समाज छात्रावास (विद्यार्थी गृह) निर्माण - उदयपुर",
      description: "उदयपुर शहर में पढ़ाई करने आने वाले हमारे गरीब और जरूरतमंद ग्रामीण बच्चों के लिए 50 कमरों के आधुनिक सर्वसुविधायुक्त छात्रावास का निर्माण कार्य प्रगति पर है। समाज के सभी बंधुओं से विनम्र आग्रह है कि इस पुनीत शिक्षा यज्ञ में अपनी स्वैच्छिक सहयोग राशि (दान) देकर सहयोग करें ताकि आने वाली पीढ़ी को उत्कृष्ट शैक्षणिक माहौल मिल सके।",
      targetAmount: 2500000,
      raisedAmount: 0,
      active: true,
      category: "भवन-निर्माण"
    },
    {
      id: "cause_2",
      title: "मेधावी छात्र एवं अनाथ बच्चों हेतु छात्रवृत्ति कोष",
      description: "समाज के ऐसे प्रतिभावान बालक-बालिकाएं जिनके सिर से पिता का साया उठ चुका है या अत्यंत निर्धन परिवार से हैं, उनकी उच्च शिक्षा (आईआईटी, नीट, सिविल सर्विसेज) का खर्च उठाने के लिए इस कोष की स्थापना की गई है। आपका दिया छोटा भी दान किसी बच्चे का भविष्य संवार सकता है।",
      targetAmount: 500000,
      raisedAmount: 0,
      active: true,
      category: "शिक्षा-मदद"
    },
    {
      id: "cause_3",
      title: "अति-निर्धन आपातकालीन चिकित्सा सहायता कोष",
      description: "हमारे समाज के किसी भी बंधु को गंभीर बीमारी (कैंसर, दुर्घटना, बाईपास) के समय फंड्स की कमी से इलाज से वंचित न होना पड़े, इसके लिए संकटकालीन सहायता कोष बनाया गया है। इसमें प्राप्त सहयोग राशि का पूर्ण विवरण पूरी पारदर्शिता के साथ इसी मंच पर प्रकाशित किया जाता है।",
      targetAmount: 1000000,
      raisedAmount: 0,
      active: true,
      category: "चिकित्सा-मदद"
    },
    {
      id: "cause_4",
      title: "धार्मिक आयोजन विशेष सहयोग कोष (भामाशाह सहयोग)",
      description: "मन्दिर निर्माण, मूर्ति प्राण-प्रतिष्ठा, धार्मिक कथाओं, सांस्कृतिक उत्सवों तथा समाज के पावन धार्मिक आयोजनों में भामाशाहों द्वारा प्रदान की जाने वाली स्वैच्छिक दान व सहयोग राशि को पूर्ण पारदर्शिता के साथ यहाँ अद्यतन किया जाएगा।",
      targetAmount: 1500000,
      raisedAmount: 0,
      active: true,
      category: "धार्मिक-योगदान"
    },
    {
      id: "cause_5",
      title: "जणवा समाज रक्तदान (ब्लड डोनेशन) सहायता कोष",
      description: "समाज के रक्तदान शिविरों के आयोजन, जरूरतमंद मरीजों को समय पर रक्त व प्लेटलेट्स उपलब्ध कराने की व्यवस्था, रक्तदाताओं के प्रोत्साहन तथा आपातकालीन रक्त संचार सहायता हेतु इस विशेष कोष की स्थापना की गई है।",
      targetAmount: 500000,
      raisedAmount: 0,
      active: true,
      category: "रक्तदान-मदद"
    }
  ],
  donations: [],
  promoters: [
    {
      id: "prom_1",
      name: "कन्हैयालाल जणवा",
      gotra: "खरोड़",
      village: "पाली",
      mobile: "9928593812",
      clicks: 0,
      rsvpCount: 0,
      donationCount: 0,
      totalDonationAmount: 0,
      dateCreated: "2026-05-10"
    },
    {
      id: "prom_2",
      name: "भंवरलाल जी जणवा",
      gotra: "पचार",
      village: "बिरामी",
      mobile: "9414001122",
      clicks: 0,
      rsvpCount: 0,
      donationCount: 0,
      totalDonationAmount: 0,
      dateCreated: "2026-05-12"
    }
  ]
};

// Database helper functions
const getDb = (): DbSchema => {
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(initialDb, null, 2), 'utf-8');
    return initialDb;
  }
  try {
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(data);
    if (!parsed.promoters) {
      parsed.promoters = [];
    }
    return parsed;
  } catch (err) {
    console.error("Error reading db file, regenerating defaults:", err);
    fs.writeFileSync(DB_FILE, JSON.stringify(initialDb, null, 2), 'utf-8');
    return initialDb;
  }
};

const saveDb = (db: DbSchema) => {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error("Error saving db file:", err);
  }
};

// Initialize Gemini client lazily/safely
const getGeminiClient = () => {
  const key = process.env.GEMINI_API_KEY;
  if (key && key !== "MY_GEMINI_API_KEY" && key.trim() !== "") {
    return new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return null;
};

// --- API Endpoints ---

// 1. Get database whole summary
app.get('/api/db', (req, res) => {
  res.json(getDb());
});

// 2. SOCIAL ACTIVITY POSTS ROUTES
app.get('/api/posts', (req, res) => {
  const db = getDb();
  // Sort posts by date descending
  const sorted = [...db.posts].sort((a, b) => b.date.localeCompare(a.date));
  res.json(sorted);
});

app.post('/api/posts', (req, res) => {
  const { title, content, author, gotra, village, category } = req.body;
  if (!title || !content || !author) {
    return res.status(400).json({ error: "शीर्षक, विवरण और लेखक का नाम आवश्यक है।" });
  }

  const db = getDb();
  const newPost: CommunityPost = {
    id: `post_${Date.now()}`,
    title,
    content,
    author,
    gotra: gotra || "",
    village: village || "",
    date: new Date().toISOString().slice(0, 10),
    category: category || "सामान्य",
    likes: 0
  };

  db.posts.push(newPost);
  saveDb(db);
  res.status(201).json(newPost);
});

app.post('/api/posts/:id/like', (req, res) => {
  const { id } = req.params;
  const db = getDb();
  const post = db.posts.find(p => p.id === id);
  if (post) {
    post.likes += 1;
    saveDb(db);
    res.json(post);
  } else {
    res.status(404).json({ error: "पोस्ट नहीं मिली।" });
  }
});

// 3. EVENTS / PROGRAMS ROUTES
app.get('/api/events', (req, res) => {
  const db = getDb();
  // Sort events by date ascending
  const sorted = [...db.events].sort((a, b) => a.date.localeCompare(b.date));
  res.json(sorted);
});

app.post('/api/events', (req, res) => {
  const { title, description, date, time, venue, organizer, contact, category } = req.body;
  if (!title || !description || !date || !venue) {
    return res.status(400).json({ error: "कार्यक्रम का शीर्षक, तिथि, समय और स्थान आवश्यक हैं।" });
  }

  const db = getDb();
  const newEvent: CommunityEvent = {
    id: `event_${Date.now()}`,
    title,
    description,
    date,
    time: time || "पूरा दिन",
    venue,
    organizer: organizer || "जणवा समाज प्रतिनिधि",
    contact: contact || "",
    category: category || "बैठक",
    rsvpList: []
  };

  db.events.push(newEvent);
  saveDb(db);
  res.status(201).json(newEvent);
});

app.post('/api/events/:id/rsvp', (req, res) => {
  const { id } = req.params;
  const { name, gotra, contact, promoterId } = req.body;

  if (!name) {
    return res.status(400).json({ error: "नाम लिखना आवश्यक है।" });
  }

  const db = getDb();
  const event = db.events.find(e => e.id === id);
  if (event) {
    // Check if details already registered
    const exists = event.rsvpList.some(r => r.name === name && r.contact === contact);
    if (exists) {
      return res.status(400).json({ error: "आप इस कार्यक्रम के लिए पहले ही सहमति दे चुके हैं।" });
    }

    event.rsvpList.push({ name, gotra, contact });

    // Track promoter recommendation
    if (promoterId) {
      const promoter = db.promoters?.find(p => p.id === promoterId);
      if (promoter) {
        promoter.rsvpCount = (promoter.rsvpCount || 0) + 1;
      }
    }

    saveDb(db);
    res.json(event);
  } else {
    res.status(404).json({ error: "कार्यक्रम नहीं मिला।" });
  }
});

// 4. DONATION CAUSES & RECORDS
app.get('/api/causes', (req, res) => {
  res.json(getDb().causes);
});

app.post('/api/donations', (req, res) => {
  const { causeId, donorName, gotra, village, amount, mobile, transactionId, message, instantApprove, screenshot, promoterId } = req.body;

  if (!causeId || !donorName || !amount) {
    return res.status(400).json({ error: "सहयोग विषय, सहयोगी का नाम और सहयोग राशि आवश्यक है।" });
  }

  const parsedAmount = parseFloat(amount);
  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    return res.status(400).json({ error: "कृपया सहयोग राशि सही अंकों में दर्ज करें।" });
  }

  const db = getDb();
  const cause = db.causes.find(c => c.id === causeId);
  if (!cause) {
    return res.status(404).json({ error: "सहयोग विषय नहीं मिला।" });
  }

  const shouldApprove = instantApprove === true;

  const newDonation: DonationRecord = {
    id: `don_${Date.now()}`,
    causeId,
    donorName,
    gotra: gotra || "",
    village: village || "",
    amount: parsedAmount,
    date: new Date().toISOString().slice(0, 10),
    mobile: mobile || "",
    transactionId: transactionId || `UPI_${Math.floor(Math.random() * 1000000000)}`,
    message: message || "",
    screenshot: screenshot || "",
    status: shouldApprove ? "स्वीकृत" : "लंबित",
    promoterId: promoterId || ""
  };

  db.donations.push(newDonation);
  if (shouldApprove) {
    cause.raisedAmount += parsedAmount;
    
    // Credit promoter immediately for instant approved donation
    if (promoterId) {
      const promoter = db.promoters?.find(p => p.id === promoterId);
      if (promoter) {
        promoter.donationCount = (promoter.donationCount || 0) + 1;
        promoter.totalDonationAmount = (promoter.totalDonationAmount || 0) + parsedAmount;
      }
    }
  }
  saveDb(db);
  res.status(201).json(newDonation);
});

// Verify simple donation (for mock accounting/auditing workflow)
app.post('/api/donations/:id/verify', (req, res) => {
  const { id } = req.params;
  const db = getDb();
  const donation = db.donations.find(d => d.id === id);

  if (donation) {
    if (donation.status === "स्वीकृत") {
      return res.status(400).json({ error: "यह सहयोग राशि पहले ही सत्यापित की जा चुकी है।" });
    }

    donation.status = "स्वीकृत";

    // Update the raisedAmount in cause
    const cause = db.causes.find(c => c.id === donation.causeId);
    if (cause) {
      cause.raisedAmount += donation.amount;
    }

    // Credit promoter upon admin verification
    if (donation.promoterId) {
      const promoter = db.promoters?.find(p => p.id === donation.promoterId);
      if (promoter) {
        promoter.donationCount = (promoter.donationCount || 0) + 1;
        promoter.totalDonationAmount = (promoter.totalDonationAmount || 0) + donation.amount;
      }
    }

    saveDb(db);
    res.json({ donation, cause });
  } else {
    res.status(404).json({ error: "सहयोग इंद्राज नहीं मिला।" });
  }
});

// Update or correct donation details (dispute resolution / payment troubleshooting)
app.post('/api/donations/:id/correct', (req, res) => {
  const { id } = req.params;
  const { transactionId, screenshot, message, donorName, mobile } = req.body;
  const db = getDb();
  const donation = db.donations.find(d => d.id === id);

  if (donation) {
    if (transactionId) donation.transactionId = transactionId;
    if (screenshot) donation.screenshot = screenshot;
    if (message) donation.message = message;
    if (donorName) donation.donorName = donorName;
    if (mobile) donation.mobile = mobile;

    saveDb(db);
    res.json(donation);
  } else {
    res.status(404).json({ error: "सहयोग इंद्राज विवरण नहीं मिला।" });
  }
});

// 5. PROMOTER & REFERRAL ENDPOINTS
app.get('/api/promoters', (req, res) => {
  const db = getDb();
  const sorted = [...(db.promoters || [])].sort((a, b) => b.clicks + b.rsvpCount + b.donationCount - (a.clicks + a.rsvpCount + a.donationCount));
  res.json(sorted);
});

app.post('/api/promoters/register', (req, res) => {
  const { name, gotra, village, mobile } = req.body;
  if (!name) {
    return res.status(400).json({ error: "प्रचारक का नाम लिखना आवश्यक है।" });
  }

  const db = getDb();
  if (!db.promoters) {
    db.promoters = [];
  }

  // Find if pre-existing by name & mobile (or name if mobile is empty)
  let promoter = db.promoters.find(p => p.name === name && (mobile ? p.mobile === mobile : true));
  
  if (!promoter) {
    promoter = {
      id: `prom_${Date.now()}`,
      name,
      gotra: gotra || "",
      village: village || "",
      mobile: mobile || "",
      clicks: 0,
      rsvpCount: 0,
      donationCount: 0,
      totalDonationAmount: 0,
      dateCreated: new Date().toISOString().slice(0, 10)
    };
    db.promoters.push(promoter);
    saveDb(db);
  }

  res.status(201).json(promoter);
});

app.post('/api/promoters/click', (req, res) => {
  const { id } = req.body;
  if (!id) {
    return res.status(400).json({ error: "प्रचारक आईडी आवश्यक है।" });
  }

  const db = getDb();
  if (!db.promoters) {
    db.promoters = [];
  }
  
  const promoter = db.promoters.find(p => p.id === id);
  if (promoter) {
    promoter.clicks += 1;
    saveDb(db);
    return res.json(promoter);
  } else {
    return res.status(404).json({ error: "प्रचारक नहीं मिला।" });
  }
});

// AI Draft Endpoint: Use Gemini to write awareness articles / posts
app.post('/api/ai/draft-post', async (req, res) => {
  const { prompt, category } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: "सुझाव / प्रॉम्प्ट आवश्यक है।" });
  }

  const client = getGeminiClient();

  if (!client) {
    // If no API Key is verified, return a helpful, crafted response fallback
    console.log("No Gemini API key available. Generating offline smart-template draft.");
    const fallbackTitle = `जणवा समाज मेवाड़ ${category || 'जागरूकता'} विशेष विचार`;
    const fallbackContent = `प्रिय समाजजनों,\n\n${prompt} के संदर्भ में - यह हमारी सामाजिक एकता और विकास की ओर एक अत्यंत महत्वपूर्ण पहल है। जणवा समाज मेवाड़ (जणवा समाज) के सभी प्रबुद्ध जनों, माताओं-बहनों और युवा साथियों से विनम्र निवेदन है कि हमारी ऐतिहासिक विरासत को संजोते हुए शिक्षा, स्वास्थ्य, और सामाजिक सुधार के अभियानों में बढ़-चढ़कर भाग लें।\n\nआइए हम सब मिलकर समाज की प्रगति में अपनी सक्रीय भूमिका निभाएं। इस दिशा में आपके सुझाव और सहयोग सादर आमंत्रित हैं।\n\nधन्यवाद,\nसमाज जागृति मंच, जणवा समाज मेवाड़`;
    return res.json({ title: fallbackTitle, content: fallbackContent, offline: true });
  }

  try {
    const aiSystemInstruction = "You are a respected and articulate community elder and content writer for 'Janwa Samaj' (an agricultural and progressive community in Rajasthan/Central India). Your goal is to write a highly inspiring, socially aware article / post in elegant, clear Hindi (Devanagari script). The tone must be polite, structured, traditional yet progressive (promoting education, health, de-addiction, co-operation, and transparency). Return the output strictly in standard JSON format containing 'title' and 'content' fields.";

    const promptMessage = `Draft an inspiring community awareness message for Janwa Samaj about: "${prompt}". Category of message is "${category}". The message should include custom headings, address the society members respectfully (बंधुओं/साथियों), and issue an appeal for cooperation and social solidarity. Output must be valid JSON: { "title": "Hindi Title Here", "content": "Hindi Article/Content Body Here" }`;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: promptMessage,
      config: {
        systemInstruction: aiSystemInstruction,
        responseMimeType: "application/json",
        temperature: 0.7,
      }
    });

    const resultText = response.text || "";
    const parsedData = JSON.parse(resultText);
    res.json(parsedData);
  } catch (error: any) {
    console.error("Gemini AI API execution error:", error);
    res.status(500).json({
      error: "एआई ड्राफ्ट जनरेट करने में त्रुटि हुई।",
      details: error.message
    });
  }
});

// Setup dev server with Vite OR compile static output in production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Mounted Vite development middleware.");
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log("Serving static production resources from:", distPath);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`===============================================`);
    console.log(`Janwa Samaj App running on: http://localhost:${PORT}`);
    console.log(`===============================================`);
  });
}

startServer();
