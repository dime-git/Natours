const nodemailer = require('nodemailer');
const pug = require('pug');
// const htmlToText = require('html-to-text');

//we created a new email class from which we can create email objects that we can then use to send emails. To create a new email object we will pass in the user and also the url that we want to be in that email. So here we assign all that stuff to the current object using this, and also some other settings that we want to have available such as a firstName and the sender of the email(from). So basically to abstract this information away from the send function, and to have it all in one central place. Than we create newTransport function which makes it really easy to create different transports for different environments(production or development), abstracting that logic from the actual send function, which should only be concerned about sending the email. So then we have the send function which takes in a template and a subject, and based on that it creates the HTML from a pug template which will be then send to the mailOptions which at the end of the function finally be send.
module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `Dimitar Milkov <${process.env.EMAIL_FROM}>`;
  }

  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      //SendGrip
      return nodemailer.createTransport({
        auth: {
          user: process.env.EMAIL_USERNAME,
          pass: process.env.EMAIL_PASSWORD
        }
      });
    }
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }

  //Send the actual email
  async send(template, subject) {
    //1) Render HTML basend on a pug template
    const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
      firstName: this.firstName,
      url: this.url,
      subject
    });

    //2) Define the email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject: subject,
      html: html
      // text: htmlToText.fromString(html)
    };

    //3) Create a transport and send email

    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send('Welcome', 'Welcome to the Natours family!');
  }

  async sendPasswordReset() {
    await this.send(
      'passwordReset',
      'Your password reset token (valid for 10 minutes)'
    );
  }
};
