const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/whatsapp_clone', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1); // Exit with failure
  }
};

// Define Schemas and Models

const contactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
});

const messageSchema = new mongoose.Schema({
  contactId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Contact' },
  text: { type: String, required: true },
  sentAt: { type: Date, default: Date.now },
  sentByUser: { type: Boolean, default: true },
});

const Contact = mongoose.model('Contact', contactSchema);
const Message = mongoose.model('Message', messageSchema);

module.exports = {
  connectDB,
  Contact,
  Message,
};
