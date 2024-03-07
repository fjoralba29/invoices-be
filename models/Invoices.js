const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: { 
    type: String, 
    required: true 
  },
  invoiceDate: { 
    type: Date, 
    required: true 
  },
  totalValue: { 
    type: Number, 
    required: true 
  },
  clientName: { 
    type: String, 
    required: true 
  },
  id: { 
    type: String, 
    required: true }
});

const Invoice = mongoose.model('Invoice', invoiceSchema);

module.exports = Invoice;