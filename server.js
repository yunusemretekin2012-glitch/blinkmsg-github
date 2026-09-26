const express = require("express");
const session = require("express-session");
const multer = require("multer");
const Database = require("better-sqlite3");
const path = require("path");
const crypto = require("crypto");

const app = express();
const PORT = 3000;

const db = new Database("database.db");

app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));

app.use(
    session({
        secret: process.env.SESSION_SECRET || "blinkmsg-change-this-secret",
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            sameSite: "lax",
            maxAge: 1000 * 60 * 60 * 24 * 30
        }
    })
);

app.use(express.static(path.join(__dirname, "public")));

const upload = multer({
    storage: multer.diskStorage({
        destination: "./uploads/avatars",
        filename: (req, file, cb) => {
            const ext = path.extname(file.originalname);
            cb(null, crypto.randomBytes(16).toString("hex") + ext);
        }
    }),
    limits: {
        fileSize: 5 * 1024 * 1024
    }
});

/* DATABASE */

db.exec(`
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    avatar TEXT DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sender_id INTEGER NOT NULL,
    receiver_id INTEGER NOT NULL,
    message TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
`);

/* PASSWORD */

function hashPassword(password) {
    const salt = crypto.randomBytes(16).toString("hex");

    const hash = crypto
        .scryptSync(password, salt, 64)
        .toString("hex");

    return `${salt}:${hash}`;
}

function verifyPassword(password, stored) {
    const [salt, storedHash] = stored.split(":");

    const hash = crypto
        .scryptSync(password, salt, 64)
        .toString("hex");

    return crypto.timingSafeEqual(
        Buffer.from(hash, "hex"),
        Buffer.from(storedHash, "hex")
    );
}

/* USERNAME */

function validUsername(username) {
    return /^[a-z0-9._-]{4,24}$/.test(username);
}

/* PASSWORD STRENGTH */

function tooWeak(password) {
    const common = [
        "123456",
        "12345678",
        "123456789",
        "password",
        "password1",
        "qwerty",
        "qwerty123",
        "abc123",
        "111111",
        "000000",
        "admin",
        "admin123"
    ];

    if (password.length < 8) return true;

    if (common.includes(password.toLowerCase())) {
        return true;
    }

    if (/^(.)\1+$/.test(password)) {
        return true;
    }

    return false;
}

/* CAPTCHA */

const captchas = [
    {
        image: "https://i.hizliresim.com/jnunanol.png",
        answer: "2510"
    },
    {
        image: "https://i.hizliresim.com/wn1e6nd0.png",
        answer: "8263"
    },
    {
        image: "https://i.hizliresim.com/fhc9nlkq.png",
        answer: "1299"
    },
    {
        image: "https://i.hizliresim.com/ckceimst.png",
        answer: "7565"
    },
    {
        image: "https://i.hizliresim.com/cv84xnto.png",
        answer: "8441"
    },
    {
        image: "https://i.hizliresim.com/5v50qpjp.png",
        answer: "2693"
    },
    {
        image: "https://i.hizliresim.com/hihthr8g.png",
        answer: "7468"
    }
];

function generateCaptcha() {
    return captchas[
        Math.floor(Math.random() * captchas.length)
    ];
}

/* AUTH MIDDLEWARE */

function requireAuth(req, res, next) {
    if (!req.session.userId) {
        return res.status(401).json({
            error: "Not authenticated"
        });
    }

    next();
}

/* REGISTER */

app.post("/api/register", (req, res) => {
    let {
        username,
        displayName,
        password,
        confirmPassword,
        captchaAnswer,
        captchaCorrect
    } = req.body;

    username = String(username || "").toLowerCase();
    displayName = String(displayName || "").trim();

    if (!validUsername(username)) {
        return res.status(400).json({
            error: "Invalid username."
        });
    }

    if (displayName.length < 2 || displayName.length > 35) {
        return res.status(400).json({
            error: "Display name must be between 2 and 35 characters."
        });
    }

    if (password !== confirmPassword) {
        return res.status(400).json({
            error: "Passwords do not match."
        });
    }

    if (tooWeak(password)) {
        return res.status(400).json({
            error: "This password is too weak. You cannot use this password; please change it."
        });
    }

    if (!captchaCorrect) {
        return res.status(400).json({
            error: "Robot verification failed."
        });
    }

    const exists = db
        .prepare("SELECT id FROM users WHERE username = ?")
        .get(username);

    if (exists) {
        return res.status(409).json({
            error: "This username is already taken."
        });
    }

    const result = db
        .prepare(`
            INSERT INTO users
            (username, display_name, password_hash)
            VALUES (?, ?, ?)
        `)
        .run(
            username,
            displayName,
            hashPassword(password)
        );

    req.session.userId = result.lastInsertRowid;

    res.json({
        success: true
    });
});

/* LOGIN */

app.post("/api/login", (req, res) => {
    const username = String(req.body.username || "").toLowerCase();
    const password = String(req.body.password || "");

    if (!req.body.captchaCorrect) {
        return res.status(400).json({
            error: "Robot verification failed."
        });
    }

    const user = db
        .prepare("SELECT * FROM users WHERE username = ?")
        .get(username);

    if (!user || !verifyPassword(password, user.password_hash)) {
        return res.status(401).json({
            error: "Incorrect username or password."
        });
    }

    req.session.userId = user.id;

    res.json({
        success: true
    });
});

/* CURRENT USER */

app.get("/api/me", requireAuth, (req, res) => {
    const user = db
        .prepare(`
            SELECT id, username, display_name, avatar
            FROM users
            WHERE id = ?
        `)
        .get(req.session.userId);

    res.json(user);
});

/* USERS */

app.get("/api/users", requireAuth, (req, res) => {
    const users = db
        .prepare(`
            SELECT id, username, display_name, avatar
            FROM users
            WHERE id != ?
            ORDER BY display_name
        `)
        .all(req.session.userId);

    res.json(users);
});

/* PROFILE */

app.get("/api/users/:username", requireAuth, (req, res) => {
    const user = db
        .prepare(`
            SELECT id, username, display_name, avatar
            FROM users
            WHERE username = ?
        `)
        .get(req.params.username.toLowerCase());

    if (!user) {
        return res.status(404).json({
            error: "User not found."
        });
    }

    res.json(user);
});

/* UPDATE PROFILE */

app.patch("/api/profile", requireAuth, (req, res) => {
    const displayName = String(
        req.body.displayName || ""
    ).trim();

    if (displayName.length < 2 || displayName.length > 35) {
        return res.status(400).json({
            error: "Display name must be between 2 and 35 characters."
        });
    }

    db.prepare(`
        UPDATE users
        SET display_name = ?, avatar = ?
        WHERE id = ?
    `).run(
        displayName,
        req.body.avatar || "",
        req.session.userId
    );

    res.json({
        success: true
    });
});

/* MESSAGES */

app.get("/api/messages/:username", requireAuth, (req, res) => {
    const other = db
        .prepare("SELECT id FROM users WHERE username = ?")
        .get(req.params.username.toLowerCase());

    if (!other) {
        return res.status(404).json({
            error: "User not found."
        });
    }

    const messages = db
        .prepare(`
            SELECT *
            FROM messages
            WHERE
                (sender_id = ? AND receiver_id = ?)
                OR
                (sender_id = ? AND receiver_id = ?)
            ORDER BY created_at ASC
        `)
        .all(
            req.session.userId,
            other.id,
            other.id,
            req.session.userId
        );

    res.json(messages);
});

/* SEND MESSAGE */

app.post("/api/messages", requireAuth, (req, res) => {
    const receiver = db
        .prepare("SELECT id FROM users WHERE username = ?")
        .get(String(req.body.username).toLowerCase());

    const message = String(req.body.message || "").trim();

    if (!receiver) {
        return res.status(404).json({
            error: "User not found."
        });
    }

    if (!message || message.length > 2000) {
        return res.status(400).json({
            error: "Invalid message."
        });
    }

    db.prepare(`
        INSERT INTO messages
        (sender_id, receiver_id, message)
        VALUES (?, ?, ?)
    `).run(
        req.session.userId,
        receiver.id,
        message
    );

    res.json({
        success: true
    });
});

/* LOGOUT */

app.post("/api/logout", requireAuth, (req, res) => {
    req.session.destroy(() => {
        res.json({
            success: true
        });
    });
});

/* CAPTCHA */

app.get("/api/captcha", (req, res) => {
    const captcha = generateCaptcha();

    req.session.captcha = captcha.answer;

    res.json({
        image: captcha.image
    });
});

/* FRONTEND ROUTES */

app.use((req, res) => {
    res.sendFile(
        path.join(__dirname, "public", "index.html")
    );
});

app.listen(PORT, () => {
    console.log(`BlinkMsg: http://localhost:${PORT}`);
});