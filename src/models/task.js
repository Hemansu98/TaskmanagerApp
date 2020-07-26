const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');

const taskSchema = new mongoose.Schema({
    desc: {
        type: String,
        required: true,
        trim: true,
    }, 
    status: {
        type: Boolean,
        default: false
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    }
}, {
        timestamps: true
});


const Task = mongoose.model('Task', taskSchema);

module.exports = Task;