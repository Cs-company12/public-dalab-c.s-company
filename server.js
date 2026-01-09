const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const { setupDatabase } = require('./database');

const app = express();
const port = 3001; // Different port from admin panel

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// Serve media from the admin panel's public folder
app.use(express.static(path.join(__dirname, '../cs-company-admin/public'))); 
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

let db;

// --- API Routes ---

// GET Media (logo, system photos, APKs)
app.get('/api/media', async (req, res) => {
    try {
        const media = await db.all('SELECT type, filename, original_name, size FROM media');
        const mediaMap = {};
        media.forEach(m => mediaMap[m.type] = m);
        res.json(mediaMap);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch media' });
    }
});

// GET Broadcast Message
app.get('/api/broadcast', async (req, res) => {
    try {
        const broadcast = await db.get("SELECT value FROM settings WHERE key = 'broadcast'");
        res.json(broadcast ? JSON.parse(broadcast.value) : null);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch broadcast' });
    }
});

// POST a new Order
app.post('/api/orders', async (req, res) => {
    const { id, name, phone, region, product, payment, price, time } = req.body;
    if (!id || !name || !phone || !region || !product || !payment || !price || !time) {
        return res.status(400).json({ error: 'Missing required order fields' });
    }
    try {
        await db.run(
            'INSERT INTO orders (id, name, phone, region, product, payment, price, time, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [id, name, phone, region, product, payment, price, time, 'pending']
        );
        res.status(201).json({ success: true, orderId: id });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// --- Frontend Route ---
app.get('/', (req, res) => {
    res.render('index');
});

// Initialize DB and Start Server
setupDatabase().then(database => {
    db = database;
    app.listen(port, () => {
        console.log(`Portal server running at http://localhost:${port}`);
    });
}).catch(error => {
    console.error("Failed to connect to the database:", error);
    process.exit(1);
});
