const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const User = require('./../models/user');
const auth = require('../middleware/auth');
const { welcomeEmail, cancellationEmail } = require('../emails/account');
const { compare, compareSync } = require('bcryptjs');

const router = new express.Router();

router.post('/users', async (req, res) => {

    const user = new User(req.body);
    try {
        await user.save();
        welcomeEmail(user.email, user.name);
        const token = await user.generateAuthToken();
        res.status(200).send({user, token});

    }
    catch(error) {
        res.status(400).send(error);
    }
});

                                                              
router.post('/users/login', async (req,res) => {

    try {
        const user = await User.findByCredential(req.body.email, req.body.password);
        const token = await user.generateAuthToken();
        res.status(200).send({user,token});
    } 
    catch(error) {
        res.status(400).send();
    }
});


router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token!=req.token;
        });
        await req.user.save();
        res.status(200).send();
    } 
    catch(error) {
        res.status(500).send();
    } 
});


router.post('/users/logoutall', auth, async (req, res) => {
    try {
        req.user.tokens = [];
        await req.user.save();
        res.status(200).send();
    }
    catch (error) {
        res.status(500).send();
    }
});


router.get('/users/me', auth, async (req, res) => {

   res.send(req.user);

});


router.patch('/users/me', auth, async (req, res) => {

    const updatesKeys = Object.keys(req.body);
    const allowedKeys = ['name', 'email', 'password', 'age'];
    const isValid = updatesKeys.every((element) => {
        return allowedKeys.includes(element);
    });

    if(!isValid) {
        return res.status(400).send('Invalid request');
    }

    try{
        //const user = await User.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators : true});
        
        updatesKeys.forEach(update => {
            req.user[update] = req.body[update];
        });
        await req.user.save();

        res.status(200).send(req.user);
    }
    catch(error) {
        res.status(400).send(error);
    }
    
});


router.delete('/users/me', auth, async (req, res) => {

    try {
        await req.user.remove();
        cancellationEmail(req.user.email, req.user.name);
        res.send(req.user);
    }
    catch(error) {
        res.status(500).send(error);
    }

});


const uplaod = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('File must be of type .jpg, .jpeg, .png'));
        }
        cb(undefined, true);
    }
});


router.post('/users/me/avatar', auth, uplaod.single('avatar'), async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize({width: 250 , height:250}).png().toBuffer();
    req.user.avatar = buffer;
    await req.user.save();
    res.send();
}, (error, req, res, next)=> {
    res.status(400).send({Error: error.message});
});


router.delete('/users/me/avatar', auth, async (req, res) => {
    try {
        req.user.avatar = undefined;
        await req.user.save();
        res.send(req.user);
    } catch(error) {
        res.status(500).send({Error: 'unable to remove the avatar. Try again!'})
    }
});


router.get('/users/:id/avatar', async (req,res) => {

    try{
        const user = await User.findById(req.params.id);

        if(!user && !user.avatar) {
            throw new Error('Unable to fetch user avatar');
        }

        res.set('Content-Type', 'image/png');
        res.send(user.avatar);
    } 
    catch(error) {
        res.status(404).send(error);
    }
});


module.exports = router;