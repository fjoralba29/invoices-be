// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const Invoice = require('./models/Invoices')

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/client_invoices', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('Connected to MongoDB');
})
.catch((error) => {
  console.error('Error connecting to MongoDB:', error);
});


// Route për regjistrimin e perdoruesit
app.post('/sign-up', async (req, res) => {
  try {
    const { name, surname, email, password, phone, address, city } = req.body;

    // Kontrolli i fushave të dërguara
    if (!name || !surname || !email || !password) {
      return res.status(400).json({ message: 'Please fill all required fields!' });
    }

    // Kontrollojme nese ekziston nje perdorues me email te dhene
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'This email already exist!' });
    }

    // Krijimi i një perdoruesi të ri
    const newUser = new User({
      name,
      surname,
      email,
      password,
      phone,
      address,
      city
    });

    // Ruajtja e perdoruesit në bazën e të dhënave
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Wrong registration', error);
    res.status(500).json({ message: 'Try again' });
  }
});

// Login user
app.post('/login', async (req, res) => {

  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    if (password !== user?.password) {
      return res.status(401).json({ message: 'Invalid password.' });
    }

    // Generate token
    const tokenSecret = crypto.randomBytes(32).toString('hex');
    const token = jwt.sign({ userId: user._id }, tokenSecret, { expiresIn: '1h' });

    const userId = user._id

    res.json({ token, userId });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Something went wrong. Please try again later.' });
  }
});

app.post('/', async (req, res) => {
  try {
    const { invoiceNumber, invoiceDate, totalValue, clientName, id } = req.body;

    // Save invoice data to the database 
    const newInvoice = new Invoice({
      invoiceNumber,
      invoiceDate,
      totalValue,
      clientName,
      id
    });

    await newInvoice.save();

    res.status(201).json({ message: 'Invoice data saved successfully', invoice: newInvoice });
  } catch (error) {
    console.error('Error saving invoice data:', error);
    res.status(500).json({ message: 'Something went wrong. Please try again later.' });
  }
});


app.get('/', async (req, res) => {
  try {
    const id = req.query.userId; 
    // Query the database for invoices associated with the user ID
    const invoices = await Invoice.find({ id });

    res.json({ invoices });
  } catch (error) {
    console.error('Error retrieving invoices:', error);
    res.status(500).json({ message: 'Something went wrong. Please try again later.' });
  }
});

app.get('/total', async (req, res) => {
  try {
    const id = req.query.userId;
    //Find and count the invoices with a certain id
    const invoices = await Invoice.find({ id })
    const numberOfInvoices = invoices.reduce((count, obj) => obj.id === id ? count + 1 : count, 0 )

    res.json({ numberOfInvoices })

  } catch (error) {
    console.error('Error fetching total number of invoices:', error);
    res.status(500).json({ message: 'Something went wrong. Please try again later.' });
  }
});

app.delete('/invoices/:id', async (req, res) => {
  try {
    const invoiceId = req.params.id;

    // Find the invoice by ID and delete it
    await Invoice.findByIdAndDelete(invoiceId);

    res.json({ message: 'Invoice deleted successfully' });
  } catch (error) {
    console.error('Error deleting invoice:', error);
    res.status(500).json({ message: 'Something went wrong. Please try again later.' });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
