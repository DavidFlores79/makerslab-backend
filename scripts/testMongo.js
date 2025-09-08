// scripts/testMongo.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Conversation = require('../models/conversation');

dotenv.config();

async function main() {
  await mongoose.connect(process.env.MONGODB || 'mongodb://127.0.0.1:27017/chatdb');
  console.log('connected');

  const c = new Conversation({
    conversationId: 'test-1',
    messages: [{ role: 'system', content: 'Eres asistente' }, { role: 'user', content: 'Hola' }]
  });
  await c.save();
  const found = await Conversation.findOne({ conversationId: 'test-1' });
  console.log('found', found);
  await mongoose.disconnect();
}

main().catch(e => console.error(e));
