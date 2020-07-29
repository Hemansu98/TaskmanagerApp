const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/user');
const { response } = require('express');
const { userOne, userOneId, setupDatabase } = require('./fixtures/db');
 
beforeEach(setupDatabase);

test('Should signup a new user' , async () => {
    const response = await request(app)
        .post('/users')
        .send({
            name: "Himanshu",
            email: "vermahimanshu769@example.com",
            password: "asdfghjkl"
        })
        .expect(200);

        // Assertion that databse is changed correctly
        const user = await User.findById(response.body.user._id);
        expect(user).not.toBeNull();

        // Assertion about the response received
        expect(response.body).toMatchObject({
            user: {  
                    name: "Himanshu",
                    email: "vermahimanshu769@example.com"
            },
            token: user.tokens[0].token 
        });

        // Assertion that our password is encrypted before saved into the database
        expect(user.password).not.toBe("asdfghjkl");
});

test('Should signin a existing user', async () => {
    const response = await request(app)
        .post('/users/login')
        .send({
            email: userOne.email,
            password: userOne.password
        })
        .expect(200); 

    const user = await User.findById(response.body.user._id);
    
    // Assertion about new token generated
    expect(response.body.token).toBe(user.tokens[1].token);


});

test('Should not signing a existing user with wrong credentials', async () => {
    await request(app)
        .post('/users/login')
        .send({
            email: userOne.email,
            password: "userepassword"
        })
        .expect(400); 
});

test('Should get profile for the authenticated user', async () => {
    await request(app)
        .get('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200);
});

test('Should not get profile for the unauthenticated user', async () => {
    await request(app)
        .get('/users/me')
        .send()
        .expect(400);
});

test('should delete the user', async () => {
    const response = await request(app)
        .delete('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200);

    const user = await User.findById(userOne._id);

    // Assertion that user is actually removed from the database
    expect(user).toBeNull();
});

test('should not delete the unauthenticated user', async () => {
    const response = await request(app)
        .delete('/users/me')
        .send()
        .expect(400);

    const user = await User.findById(userOne._id);

    // Assertion that user is actually not removed from the database
    expect(user).not.toBeNull();
    
});


test('Should upload the avatar', async () => {
    const response = await request(app)
        .post('/users/me/avatar')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .attach('avatar', 'test/fixtures/profile-pic.jpg')
        .expect(200);

        const user = await User.findById(userOneId);

        // Assertion that avatar is saved as buffer in the database
        expect(user.avatar).toEqual(expect.any(Buffer));
});


test('Should update valid user fields', async () => {
    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            name: "Su"
        })
        .expect(200);

        const user = await User.findById(userOneId);

        // Assertion that the name of the user has been changed in the database
        expect(user.name).toBe("Su");
});

test('Should not update invalid user fields', async () => {
    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            location: "Gaya"
        })
        .expect(400);

});