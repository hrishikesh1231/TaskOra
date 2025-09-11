const mongoose = require('mongoose');

const { GigSchema } = require('../schemas/GigsSchema');

const Gig = mongoose.model('gig', GigSchema);

module.exports={Gig}