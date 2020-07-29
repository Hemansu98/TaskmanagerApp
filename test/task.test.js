const request = require('supertest');
const app = require('../src/app');
const Task = require('../src/models/task');
const { response } = require('express');
const { userOne, userOneId, userTwo, userTwoId, taskOne, taskTwo, taksThree, setupDatabase } = require('./fixtures/db');

beforeEach(setupDatabase);

test('Should create task for user', async () => {
    const response = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            desc: "l"
        })
        .expect(201);

        const task = await Task.findById(response.body._id);

        // Assertion that task is sucessfully created in the database
        expect(task).not.toBeNull();

        // Assertion that task status is set to false by default
        expect(task.status).toEqual(false);
});

test('Should get the all task associated with the user', async () => {
    const response = await request(app)
        .get('/tasks')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200);

        // Assertion that the length of the response array is 2
        expect(response.body.length).toBe(2);
});

test('Should not delete the userone task by usertwo',  async () => {
    const response = await request(app)
        .delete(`/users/:${taskOne._id}`)
        .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
        .send()
        .expect(404);

    const user = await Task.findById(taskOne._id);

    // Assertion that taskOne is not deleted from the database
    expect(user).not.toBeNull();

});