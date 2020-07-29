const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('../../src/models/user');
const Task = require('../../src/models/task');

const userOneId = new mongoose.Types.ObjectId();
const userOne = {
    _id: userOneId,
    name: "Hemansu",
    email: "himanshu.verma.cer15@example.com",
    password: "asdfghjkl",
    tokens: [{
        token: jwt.sign({_id: userOneId}, process.env.JWT_SECRET_KEY)
        }
    ] 
}

const userTwoId = new mongoose.Types.ObjectId();
const userTwo = {
    _id: userTwoId,
    name: "Su",
    email: "Su@gmail.com",
    password: "asdfghjkl",
    tokens: [{
        token: jwt.sign({_id: userTwoId}, process.env.JWT_SECRET_KEY)
        }
    ] 
}

const taskOne = {
    _id: new mongoose.Types.ObjectId(),
    desc: "a",
    status: false,
    createdBy: userOneId
}

const taskTwo = {
    _id: new mongoose.Types.ObjectId(),
    desc: "b",
    status: true,
    createdBy: userTwoId
}

const taskThree = {
    _id: new mongoose.Types.ObjectId(),
    desc: "c",
    status: false,
    createdBy: userOneId
}

const setupDatabase = async () => {
    await User.deleteMany({});
    await Task.deleteMany({});
    await new User(userOne).save();
    await new User(userTwo).save();
    await new Task(taskOne).save();
    await new Task(taskTwo).save();
    await new Task(taskThree).save();
}

module.exports = {
    userOne,
    userOneId,
    userTwo,
    userTwoId,
    taskOne,
    taskTwo,
    taskThree,
    setupDatabase
};