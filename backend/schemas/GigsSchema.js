const { Schema } = require('mongoose');

const GigSchema = new Schema({                     
  title: { type: String, required: true },            // Gig title
  description: { type: String, required: true },      // Gig description
  location: { type: String, required: true },         // City or area
  postedBy: { type: String },                         // Optional (can be empty)
  category: { type: String, required: true },         // e.g., Event, Market
  date: { type: Date, required: true },               // Event date
  // workDays: { type: Number, required: true },         // Duration in days
  // payment: { type: String, required: true },          // Payment format
  contact: { type: String, required: true },          // Contact number
  createdAt: { type: Date, default: Date.now }        // Auto timestamp
});

module.exports = { GigSchema };
