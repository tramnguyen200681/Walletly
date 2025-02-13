const express = require('express');
const bodyParser = require('body-parser'); //extract jsol data from http requests.
const mongoose = require('mongoose');

const app = express();
const port = 3000;

//Connect to mongodb
mongoose.connect('mongodb://localhost:27017/walletly', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

//Define schema + model
const expenseSchema = new mongoose.Schema({
  name: String,
  amount: Number,
  category: String,
});

const Expense = mongoose.model('Expense', expenseSchema);

//Middleware to set headers for CORS
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*'); //Allow all domaisn
  res.setHeader('Access-Control-Allow-Methods','GET, POST, DELETE, OPTIONS'); //Allow specific methods
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type'); //Allow alll headers
  next();
});

//Middleware to handle json body
app.use(bodyParser.json());

//Handle preflight requests 
app.options('*', (req, res) => {
  res.sendStatus(200); //OK for preflight request
});

//Main Endpoint for API
app.get('/', (req, res) => {
  res.send('Welcome to Walletly API. Use /expenses, /add-expense, or /delete-expense/:id');
});

// Endpoint to add expense
app.post('/add-expense', async (req, res) => {
  try {
    const { name, amount, category } = req.body;
    const newExpense = new Expense({ name, amount, category });
    await newExpense.save();
    res.status(200).json({ message: 'Expense added successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error adding expense' });
  }
});

//Endpoint to get expense list
app.get('/expenses', async (req, res) => {
  try {
    const expenses = await Expense.find();
    res.status(200).json(expenses);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching expenses' });
  }
});

//Endpoint to delete expense
app.delete('/delete-expense/:id', async (req, res) => {
  try {
    await Expense.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Expense deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting expense' });
  }
});

//Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
