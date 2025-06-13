require('dotenv').config();                 // ← load .env first

const express     = require('express');
const mongoose    = require('mongoose');
const session     = require('express-session');
const MongoStore  = require('connect-mongo');
const cors        = require('cors');
const bcrypt      = require('bcrypt');
const bodyParser  = require('body-parser');
const path        = require('path');

const app  = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI      = process.env.MONGO_URI;
const SESSION_SECRET = process.env.SESSION_SECRET;

/* ---------------- basic middleware ---------------- */
app.use(cors({
  origin: 'https://thespendsmart.netlify.app',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, '../frontend')));
app.use(express.static(path.join(__dirname, '../frontend/public')));

/* ---------------- connect Mongo, then mount session ---------------- */
(async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✓ MongoDB connected');

    app.use(session({
      secret: SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === 'production', // HTTPS only in prod
        httpOnly: true,
        sameSite: 'none',                              // cross‑site cookie for Netlify
        maxAge: 24 * 60 * 60 * 1000                   // 24 h
      },
      store: MongoStore.create({
        client: mongoose.connection.getClient(),       // ← no mongoUrl exposed
        collectionName: 'sessions'
      })
    }));


// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

// User Schema
const userSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String
});

const User = mongoose.model('User', userSchema);

// Authentication Middleware
const authenticateUser = (req, res, next) => {
    if (req.session.user) {
        next();
    } else {
        res.status(401).json({ message: 'Unauthorized' });
    }
};

// Signup Route
app.post('/signup', async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ name, email, password: hashedPassword });
        await newUser.save();
        res.status(201).json({ message: 'Signup successful' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Login Route
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }
        req.session.user = user;
        res.status(200).json({ message: 'Login successful', name: user.name });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Logout Route
app.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error("Error destroying session:", err);
            return res.status(500).send("Failed to log out");
        }
        res.clearCookie('connect.sid');
        res.status(200).json({ message: 'Logout successful' });
    });
});

// Income Schema
const incomeSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    description: String,
    date: Date,
    amount: Number,
    category: String
});

const Income = mongoose.model('Income', incomeSchema);

// Expense Schema
const expenseSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    description: String,
    date: Date,
    amount: Number,
    category: String
});

const Expense = mongoose.model('Expense', expenseSchema);

// Fetch Income Route
app.get('/incomes', authenticateUser, async (req, res) => {
    const userId = req.session.user._id;
    try {
        const incomes = await Income.find({ userId });
        res.status(200).json(incomes);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Add Income Route
app.post('/add-income', authenticateUser, async (req, res) => {
    const { description, date, amount, category } = req.body;
    const userId = req.session.user._id;

    if (!description || !date || isNaN(amount) || !category) {
        return res.status(400).json({ message: 'Invalid data' });
    }

    try {
        const newIncome = new Income({ userId, description, date, amount, category });
        await newIncome.save();
        res.status(201).json({ message: 'Income added successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Fetch Expense Route
app.get('/expenses', authenticateUser, async (req, res) => {
    const userId = req.session.user._id;
    try {
        const expenses = await Expense.find({ userId });
        res.status(200).json(expenses);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Add Expense Route
app.post('/add-expense', authenticateUser, async (req, res) => {
    const { description, date, amount, category } = req.body;
    const userId = req.session.user._id;

    if (!description || !date || isNaN(amount) || !category) {
        return res.status(400).json({ message: 'Invalid data' });
    }

    try {
        const newExpense = new Expense({ userId, description, date, amount, category });
        await newExpense.save();
        res.status(201).json({ message: 'Expense added successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
