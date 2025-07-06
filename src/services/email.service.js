"use strict";

const nodemailer = require("nodemailer");

let configOptions = {
  // config mail server
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
  tls: {
    // do not fail on invalid certs
    rejectUnauthorized: false,
  },
};

const sentEmailAsync = async (email, subject, content) => {
  try {
    // Create a transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport(configOptions);

    // Setup email data
    let mailOptions = {
      from: '"quangminhit1102" <quangminhit1102@gmail.com>',
      to: email,
      subject: subject,
      text: content,
    };

    // Send the email
    let info = await transporter.sendMail(mailOptions);
    console.log("Email sent: " + info.response);
    return true;
  } catch (error) {
    console.error("Error sending email: ", error);
    return false;
  }
};

module.exports = {
  sentEmailAsync,
};
