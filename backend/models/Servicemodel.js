const mongoose = require('mongoose');

const { ServiceSchema } = require('../schemas/ServiceSchema');

const Service = mongoose.model('service',ServiceSchema);

module.exports={Service}