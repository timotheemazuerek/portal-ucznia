const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const admin = require('firebase-admin');
const cors = require('cors');

// --- Firebase Admin SDK Initialization ---
// IMPORTANT: Replace with the actual path to your Firebase service account key JSON file.
// Download this file from your Firebase project settings > Service accounts.
// KEEP THIS FILE SECURE and DO NOT commit it to public repositories.
// Consider using environment variables to store the path or the key content.
try {
  const serviceAccount = require('./firebase-service-account-key.json'); // Placeholder path
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  console.log('Firebase Admin SDK initialized successfully.');
} catch (error) {
  console.error('Error initializing Firebase Admin SDK:', error.message);
  console.error('Please ensure firebase-service-account-key.json is correctly placed and configured.');
  // process.exit(1); // Optionally exit if Firebase Admin fails to initialize
}

const app = express();
const PORT = process.env.PORT || 3001; // Use environment variable for port or default to 3001

// --- Middleware ---
app.use(cors({
  origin: 'http://localhost:3000', // Allow requests from React dev server (default port 3000)
  optionsSuccessStatus: 200
}));
app.use(express.json()); // For parsing application/json
app.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Serve files from uploads directory

// --- Authentication Middleware (Placeholder) ---
// This middleware will verify Firebase ID tokens
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const idToken = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split('Bearer ')[1] : null;

  if (!idToken) {
    return res.status(401).json({ error: 'Unauthorized: No token provided.' });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken; // Add user information to the request object
    next();
  } catch (error) {
    console.error('Error verifying Firebase ID token:', error);
    return res.status(403).json({ error: 'Forbidden: Invalid or expired token.' });
  }
};

// --- File Upload Configuration ---
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Use original file name or generate a unique one
        // For substitutions, it might be date-based as before
        const date = req.body.date; // Assuming date is passed in the request body
        if (date && (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || file.mimetype === 'application/vnd.ms-excel')) {
            const ext = path.extname(file.originalname);
            cb(null, `${date}${ext}`);
        } else {
            // Fallback for other files or if date is not provided
            cb(null, `${Date.now()}-${file.originalname}`);
        }
    }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    // Example: Accept only excel files for a specific route, or any file for others
    // This can be customized per route later
    cb(null, true);
  }
});

// --- API Routes ---

// Example: Secure route (requires authentication)
app.get('/api/secure-data', authenticateToken, (req, res) => {
  res.json({
    message: `Hello ${req.user.name || req.user.email}! This is secure data.`,
    uid: req.user.uid
  });
});

// Existing file upload route (can be made secure with authenticateToken)
// For admin uploading substitutions:
app.post('/api/upload/substitutions', authenticateToken, upload.single('file'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'Brak pliku!' });
    // Additional logic: validate if user is admin based on req.user.uid or custom claims
    console.log('Uploaded by user UID:', req.user.uid);
    res.json({ message: `Plik zastępstw ${req.file.filename} zapisano pomyślnie.` });
});

// Existing route to get substitution data (can be public or secure)
app.get('/api/substitutions/:date', (req, res) => {
    const filename = `${req.params.date}.xlsx`; // Assuming .xlsx, adjust if other formats are possible
    const filePath = path.join(uploadDir, filename);
    if (fs.existsSync(filePath)) {
        res.sendFile(filePath);
    } else {
        // Try fetching from external source as a fallback, or just return 404
        // For now, just 404 if not locally available.
        res.status(404).json({ error: `Plik zastępstw dla ${req.params.date} nie znaleziony.` });
    }
});


// --- Placeholder routes for other features ---
// All data will be stored in Firestore for now.
// We will assume simple CRUD operations.

// Calendar Events
// GET /api/calendar - Get all calendar events (e.g., for a month or range)
// POST /api/calendar - Add a new calendar event (Admin)
// PUT /api/calendar/:eventId - Update a calendar event (Admin)
// DELETE /api/calendar/:eventId - Delete a calendar event (Admin)
app.get('/api/calendar', authenticateToken, async (req, res) => {
    try {
        // Example: Fetching from a 'calendarEvents' collection in Firestore
        const snapshot = await admin.firestore().collection('calendarEvents').orderBy('date', 'asc').get();
        if (snapshot.empty) {
            return res.status(200).json([]);
        }
        const events = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.status(200).json(events);
    } catch (error) {
        console.error("Error fetching calendar events:", error);
        res.status(500).json({ error: "Failed to fetch calendar events." });
    }
});

app.post('/api/calendar', authenticateToken, async (req, res) => {
    // TODO: Add admin role check here using req.user.uid and custom claims or a list
    try {
        const { title, date, description, type } = req.body; // type: exam, holiday, deadline etc.
        if (!title || !date || !type) {
            return res.status(400).json({ error: "Missing required fields: title, date, type." });
        }
        const newEvent = { title, date, description, type, createdAt: admin.firestore.FieldValue.serverTimestamp() };
        const docRef = await admin.firestore().collection('calendarEvents').add(newEvent);
        res.status(201).json({ id: docRef.id, ...newEvent });
    } catch (error) {
        console.error("Error adding calendar event:", error);
        res.status(500).json({ error: "Failed to add calendar event." });
    }
});


// School Events
// GET /api/events - Get all school events (Public)
// POST /api/events - Add a new school event (Admin)
app.get('/api/events', async (req, res) => { // Public route
    try {
        const snapshot = await admin.firestore().collection('schoolEvents').orderBy('eventDate', 'desc').get();
        if (snapshot.empty) {
            return res.status(200).json([]);
        }
        const events = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.status(200).json(events);
    } catch (error) {
        console.error("Error fetching school events:", error);
        res.status(500).json({ error: "Failed to fetch school events." });
    }
});

app.post('/api/events', authenticateToken, async (req, res) => {
    // TODO: Add admin role check
    try {
        const { title, eventDate, description, location } = req.body;
        if (!title || !eventDate) {
            return res.status(400).json({ error: "Missing required fields: title, eventDate." });
        }
        const newEvent = { title, eventDate, description, location, createdAt: admin.firestore.FieldValue.serverTimestamp() };
        const docRef = await admin.firestore().collection('schoolEvents').add(newEvent);
        res.status(201).json({ id: docRef.id, ...newEvent });
    } catch (error) {
        console.error("Error adding school event:", error);
        res.status(500).json({ error: "Failed to add school event." });
    }
});


// Announcements
// GET /api/announcements - Get all announcements (Public)
// POST /api/announcements - Add a new announcement (Admin/Teacher)
app.get('/api/announcements', async (req, res) => { // Public route
    try {
        const snapshot = await admin.firestore().collection('announcements').orderBy('createdAt', 'desc').limit(20).get();
        if (snapshot.empty) {
            return res.status(200).json([]);
        }
        const announcements = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.status(200).json(announcements);
    } catch (error) {
        console.error("Error fetching announcements:", error);
        res.status(500).json({ error: "Failed to fetch announcements." });
    }
});

app.post('/api/announcements', authenticateToken, async (req, res) => {
    // TODO: Add admin/teacher role check
    try {
        const { title, content, author } = req.body; // author could be derived from req.user
        if (!title || !content) {
            return res.status(400).json({ error: "Missing required fields: title, content." });
        }
        const newAnnouncement = { title, content, author: author || req.user.name || req.user.email, postedByUid: req.user.uid, createdAt: admin.firestore.FieldValue.serverTimestamp() };
        const docRef = await admin.firestore().collection('announcements').add(newAnnouncement);
        res.status(201).json({ id: docRef.id, ...newAnnouncement });
    } catch (error) {
        console.error("Error adding announcement:", error);
        res.status(500).json({ error: "Failed to add announcement." });
    }
});


// News
// GET /api/news - Get all news articles (Public)
// POST /api/news - Add a new news article (Admin/Editor)
app.get('/api/news', async (req, res) => { // Public route
    try {
        const snapshot = await admin.firestore().collection('newsArticles').orderBy('publishedAt', 'desc').limit(20).get();
        if (snapshot.empty) {
            return res.status(200).json([]);
        }
        const articles = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.status(200).json(articles);
    } catch (error) {
        console.error("Error fetching news articles:", error);
        res.status(500).json({ error: "Failed to fetch news articles." });
    }
});

app.post('/api/news', authenticateToken, async (req, res) => {
    // TODO: Add admin/editor role check
    try {
        const { title, summary, content, imageUrl } = req.body;
        if (!title || !summary || !content) {
            return res.status(400).json({ error: "Missing required fields: title, summary, content." });
        }
        const newArticle = { title, summary, content, imageUrl, author: req.user.name || req.user.email, publishedByUid: req.user.uid, publishedAt: admin.firestore.FieldValue.serverTimestamp(), updatedAt: admin.firestore.FieldValue.serverTimestamp() };
        const docRef = await admin.firestore().collection('newsArticles').add(newArticle);
        res.status(201).json({ id: docRef.id, ...newArticle });
    } catch (error) {
        console.error("Error adding news article:", error);
        res.status(500).json({ error: "Failed to add news article." });
    }
});


// --- Health Check Route ---
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'UP', message: 'Server is running' });
});


// --- Start Server ---
app.listen(PORT, () => {
  console.log(`Serwer backend działa na http://localhost:${PORT}`);
  console.log('---');
  console.log('REMINDER: Ensure your Firebase Service Account Key (firebase-service-account-key.json) is correctly set up and secured.');
  console.log('Requests from http://localhost:3000 (default React app) are allowed by CORS.');
  console.log('---');
});
