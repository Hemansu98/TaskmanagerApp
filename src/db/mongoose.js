const mongoose = require('mongoose');
const { version, Schema } = require('mongoose');

mongoose.connect(process.env.MONGODB_URL, 
            {useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true});
