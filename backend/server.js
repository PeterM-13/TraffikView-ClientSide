import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const pool = new pg.Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    port: process.env.DB_PORT,
    ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false
});

const app = express();
app.use(express.json());

const SECRET_KEY = process.env.JWT_SECRET;

async function initialiseDatabase() {
    let client;
    try {
        client = await pool.connect();
        await client.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                password TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS searches (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                query TEXT NOT NULL,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log("Database initialised");
    } catch (error) {
        console.error("Database initialisation error:", error);
    } finally {
        if (client) client.release();
    }
}

// Run database initialisation on server start
initialiseDatabase();


// Signup endpoint
app.post("/api/signup", async (req, res) => {
    const { email, password } = req.body;
    let client;

    try {
        client = await pool.connect();
        const existingUser = await client.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
        );

        if (existingUser.rows.length > 0) {
            return res.status(400).json({ message: "User already exists" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const result = await client.query(
            "INSERT INTO users (email, password) VALUES ($1, $2) RETURNING *",
            [email, hashedPassword]
        );

        const token = jwt.sign(
            { userId: result.rows[0].id },
            SECRET_KEY,
            { expiresIn: "1h" }
        );

        res.status(201).json({ token });
    } catch (error) {
        console.error("Signup error:", error);
        res.status(500).json({ message: "Server error" });
    } finally {
        if (client) client.release();
    }
});

// Login endpoint
app.post("/api/login", async (req, res) => {
    const { email, password } = req.body;
    let client;

    try {
        client = await pool.connect();
        const result = await client.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const user = result.rows[0];
        const isMatch = bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign(
            { userId: user.id },
            SECRET_KEY,
            { expiresIn: "1h" }
        );

        res.json({ token });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Server error" });
    } finally {
        if (client) client.release();
    }
});

// Middleware to authenticate users
const authMiddleware = (req, res, next) => {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
        return res.status(401).json({ message: "No token, authorisation denied" });
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        req.userId = decoded.userId;
        next();
    } catch (error) {
        res.status(401).json({ message: "Token is not valid" });
    }
};

// Save a search
app.post("/api/search", authMiddleware, async (req, res) => {
    const { query } = req.body;
    const userId = req.userId;
    let client;

    try {
        client = await pool.connect();
        await client.query(
            "INSERT INTO searches (user_id, query) VALUES ($1, $2)",
            [userId, query]
        );

        res.status(201).json({ message: "Search saved" });
    } catch (error) {
        console.error("Save search error:", error);
        res.status(500).json({ message: "Server error" });
    } finally {
        if (client) client.release();
    }
});

// Get the last 5 searches for the authenticated user
app.get("/api/searches", authMiddleware, async (req, res) => {
    const userId = req.userId;
    let client;

    try {
        client = await pool.connect();
        const result = await client.query(
            "SELECT query FROM searches WHERE user_id = $1 ORDER BY timestamp DESC LIMIT 5",
            [userId]
        );

        const searches = result.rows.map(row => row.query);
        res.json(searches);
    } catch (error) {
        console.error("Get searches error:", error);
        res.status(500).json({ message: "Server error" });
    } finally {
        if (client) client.release();
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
