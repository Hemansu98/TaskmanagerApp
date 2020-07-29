const express = require('express');
const Task = require('./../models/task');
const auth = require('../middleware/auth');
const { compareSync } = require('bcryptjs');
const router = new express.Router();

router.post('/tasks', auth, async (req, res) => {

    const task = new Task({
        ...req.body,
        createdBy: req.user._id
    });

    try {
        await task.save();
        res.status(201).send(task);
    } 
    catch(error) {
        res.send(500).send(error);
    }

});

router.get('/tasks/:id', auth, async (req, res) => {

    const _id = req.params.id;
    
    try {
        const task = await Task.findOne({_id: _id, createdBy: req.user._id});
        if(!task) {
            return res.status(404).send();
        }
        res.status(200).send(task);
    }
    catch(error) {
        res.status(500).send(error);
    }
});

router.get('/tasks', auth, async (req, res) => {
    const match = {};
    const sort = {};

    if(req.query.status) {
        match.status = req.query.status == 'true';
    }

    if(req.query.sortBy) {
        const temp = req.query.sortBy.split(':');
    }
    
    if(req.query.sortBy) {
        sort[temp[0]] = temp[1] === 'desc' ? -1 : 1;
    }

    try {
        await req.user.populate({
            path: 'tasks',
            match: match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }          
            }).execPopulate();
 
        if(!req.user.tasks) {
            return res.status(404).send();
        }
        res.status(200).send(req.user.tasks);
    }
    catch(error) {
        res.status(500).send();
    }

});

router.patch('/tasks/:id', auth, async (req, res) => {

    const updatesKeys = Object.keys(req.body);
    const allowedKeys = ['desc', 'status'];
    const isValid = updatesKeys.every((element) => {
        return allowedKeys.includes(element);
    });

    if(!isValid) {
        return res.status(400).send('Invalid request');
    }

    try {
        //const task = await Task.findByIdAndUpdate(req.params.id, req.body, 
          //  {new: true, runValidators: true});

        const task = await Task.findOne({_id: req.params.id, createdBy: req.user._id});
        if(!task) {
            return res.status(404).send();
        }

        updatesKeys.forEach(update => {
            task[update] = req.body[update];
        });
        await task.save();

        res.status(200).send(task);
    }
    catch(error) {
        res.status(400).send(error);
    }

});

router.delete('/tasks/:id', auth, async (req, res) => {

    try {
        const task = await Task.findOneAndDelete({_id: req.params.id, createdBy: req.user._id})
        if(!task) {
            return res.status(404).send();
        }
        res.status(200).send(task);
    }
    catch(error) {
        res.status(500).send(error);
    }

});

module.exports = router;