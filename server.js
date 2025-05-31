const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Middleware
app.use(express.json());
app.use(cors());
app.use(express.static('public')); // serve frontend

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/whatsapp_clone', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => console.log('MongoDB connected'));

// Mongoose schemas
const contactSchema = new mongoose.Schema({
  name: String,
  phone: String,
});
const messageSchema = new mongoose.Schema({
  contactId: mongoose.Schema.Types.ObjectId,
  text: String,
  sentAt: { type: Date, default: Date.now },
  sentByUser: Boolean,
});

const Contact = mongoose.model('Contact', contactSchema);
const Message = mongoose.model('Message', messageSchema);

// API routes

// Get all contacts
app.get('/api/contacts', async (req, res) => {
  const contacts = await Contact.find();
  res.json(contacts);
});

// Get messages for a contact
app.get('/api/messages/:contactId', async (req, res) => {
  const messages = await Message.find({ contactId: req.params.contactId }).sort('sentAt');
  res.json(messages);
});

// Add a new contact
app.post('/api/contacts', async (req, res) => {
  const contact = new Contact(req.body);
  await contact.save();
  res.json(contact);
});

// WebSocket message handling
wss.on('connection', (ws) => {
  console.log('WebSocket client connected');

  ws.on('message', async (data) => {
    try {
      const msg = JSON.parse(data); // Expect JSON { contactId, text, sentByUser }
      console.log('Received:', msg);

      // Save message to DB
      const message = new Message({
        contactId: msg.contactId,
        text: msg.text,
        sentByUser: msg.sentByUser,
      });
      await message.save();

      // Broadcast message to all other clients
      wss.clients.forEach((client) => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(message));
        }
      });
    } catch (error) {
      console.error('Error handling message:', error);
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
