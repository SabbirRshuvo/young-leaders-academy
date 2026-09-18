const nodemailer = require('nodemailer');

async function testEmail() {
  const user = 'sabbirhshuvo11@gmail.com';
  const pass = 'vwkygdhcqlbmarpz';

  console.log('Testing connection for:', user);
  
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: user,
      pass: pass
    }
  });

  try {
    await transporter.verify();
    console.log("SUCCESS: Server is ready to take our messages");
  } catch (error) {
    console.error("FAILED to connect. Error:", error);
  }
}

testEmail();
