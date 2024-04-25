const { google } = require("googleapis");
const nodemailer = require("nodemailer");
const { file } = require("googleapis/build/src/apis/file");

const CLIENT_EMAIL = process.env.CLIENT_EMAIL; //your email from where you'll be sending emails to users
const CLIENT_ID = process.env.CLIENT_ID; // Client ID generated on Google console cloud
const CLIENT_SECRET = process.env.CLIENT_SECRET; // Client SECRET generated on Google console cloud
const REDIRECT_URI = process.env.REDIRECT_URI; // The OAuth2 server (playground)
const REFRESH_TOKEN = process.env.REFRESH_TOKEN; // The refreshToken we got from the the OAuth2 playground

exports.sendMail = async  (email, subject, message, file, fileName) => {
    const OAuth2Client = new google.auth.OAuth2(
      CLIENT_ID,
      CLIENT_SECRET,
      REDIRECT_URI
    );
  
    OAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });
    try {
      // Generate the accessToken on the fly
      const accessToken = await OAuth2Client.getAccessToken();
  
      // Create the email envelope (transport)
      const transport = nodemailer.createTransport({
        service: "gmail",
        auth: {
          type: "OAuth2",
          user: CLIENT_EMAIL,
          clientId: CLIENT_ID,
          clientSecret: CLIENT_SECRET,
          refreshToken: REFRESH_TOKEN,
          accessToken: accessToken,
        },
      });
      const htmlEmail = `<html>
      <head><link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.3.1/dist/css/bootstrap.min.css" integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous"></head>
      <body>
      <div class="container">
      <div class="row justify-content-center">
      <h3 style="color:blue">Sent by Elzen Music</h3>
      
      
      <h3>Elzen Music</h3>
      <p>${message}</p>
      </div>
      </div>
      </body>
      
      </html>
      
    `;
      // Create the email options and body
      // ('email': user's email and 'name': is the e-book the user wants to receive)
      const mailOptions = {
        from: `Elzen Music <${CLIENT_EMAIL}>`,
        to: email,
        subject: subject,
        html: htmlEmail,
        attachments: [
          {
            filename: fileName,
            path: file,
            contentType: "application/pdf",
          },
        ],
      };
  
      // Set up the email options and delivering it
      const result = await transport.sendMail(mailOptions);
      return result;
    } catch (error) {
      logger.error(error);
      return error;
    }
  }