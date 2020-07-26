const sgMail = require('@sendgrid/mail');
const sendGridAPIKey = process.env.SENDGRID_API_KEY;

// Setting Api key
sgMail.setApiKey(sendGridAPIKey);

const welcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'vermahimanshu769@gmail.com',
        subject: 'Welcome to the Task Manager!',
        text: `Hi ${name}, Welcome to the Task Manager. Let me know how you get along with the app!`
    });
}

const cancellationEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'vermahimanshu769@gmail.com',
        subject: 'Cancellation Email!',
        text: `Hello ${name}, please give your valuable feedback so that we can improve our service!`
    });
}

module.exports = { 
    welcomeEmail,
    cancellationEmail 
};