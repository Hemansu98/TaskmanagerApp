const mongoose = require('mongoose');
const validator = require('validator');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Task = require('./task');

const userSchema = new mongoose.Schema({
        name: {
                type: String,
                required: true,
                trim: true,
        },
        email: {
                type: String,
                unique: true,
                required: true,
                trim: true,
                lowercase: true,
                validate(value) {
                        if(!validator.isEmail(value)) {
                                throw new Error('Invalid Email.!');
                        }
                }
        },
        password: {
                type: String,
                required: true,
                trim: true,
                minlength: 7,
                validate(value) {
                        if(value.includes('password')) {
                                throw new Error('Password cannnot be password.!');
                        }
                }
        },
        age: {
                type: Number,
                default: 0,
                validate(value) {
                        if(value < 0) {
                                throw new Error('Age should be positive.!');
                        }
                }
        },
        tokens: [{
                token: {
                        type: String, 
                        requied: true
                }
        }],
        avatar: {
                type: Buffer
        }
}, {
        timestamps: true
});

userSchema.virtual('tasks', {
        ref: 'Task',
        localField: '_id',
        foreignField: 'createdBy'
});

userSchema.methods.toJSON = function() {
        const user = this;
        const userObject = user.toObject();

        delete userObject.password;
        delete userObject.tokens;
        delete userObject.avatar;

        return userObject;
}

userSchema.methods.generateAuthToken = async function() {
        const user = this;
        const token = jwt.sign({_id: user._id.toString()}, process.env.JWT_SECRET_KEY , {expiresIn: 100000});

        user.tokens = user.tokens.concat({token: token});
        await user.save();
        
        return token;
}


userSchema.statics.findByCredential = async (email, password) => {
        const user = await User.findOne({email});
        if(!user) {
                throw new Error('Unable to login');
        }

        const isValid = await bcryptjs.compare(password, user.password);
        if(!isValid) {
                throw new Error('Unable to login');
        }
        return user;
}

// Hash the plain text password before saving it
userSchema.pre('save',async function(next) {
        
        const user = this;
        if(user.isModified('password')) {
                user.password = await bcryptjs.hash(user.password, 8);
        }
        next();
});


// Delete the user task when user is removed
userSchema.pre('remove', async function(next) {
        const user = this;
        await Task.deleteMany({ createdBy: user._id });
        next();
})

const User = mongoose.model('user', userSchema);

module.exports = User;