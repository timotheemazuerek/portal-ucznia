const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;


const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const date = req.body.date;  
        if (!date) return cb(new Error("Brak daty!"));
        const ext = path.extname(file.originalname);
        cb(null, `${date}${ext}`);  
    }
});

const upload = multer({ storage });

app.use(express.static('public'));
app.use(express.json());


app.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'Brak pliku!' });
    res.json({ message: `Plik zapisano jako ${req.file.filename}` });
});


app.get('/data/:date.xlsx', (req, res) => {
    const filePath = path.join(uploadDir, `${req.params.date}.xlsx`);
    if (fs.existsSync(filePath)) {
        res.sendFile(filePath);
    } else {
        res.status(404).json({ error: 'Plik nie znaleziony' });
    }
});


app.listen(PORT, () => console.log(`Serwer działa na http://localhost:${PORT}`));
