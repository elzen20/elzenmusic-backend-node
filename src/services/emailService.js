const { google } = require("googleapis");
const nodemailer = require("nodemailer");

const CLIENT_EMAIL = process.env.CLIENT_EMAIL;
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;

exports.sendMail = async (emailDestination, subject, htmlEmail, attachment = null, fileName = null, ) => {
  const OAuth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URI
  );

  OAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

  try {
    const accessToken = await OAuth2Client.getAccessToken();

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


    const mailOptions = {
      from: `Elzen Music <${CLIENT_EMAIL}>`,
      to: emailDestination,
      subject: subject,
      html: htmlEmail,
      attachments: attachment
        ? [{ filename: fileName, path: attachment, contentType: "application/pdf" }]
        : [],
    };

    const result = await transport.sendMail(mailOptions);
    console.log("Enviado correctamente");
    return result;
  } catch (error) {
    console.error(error);
    return error;
  }
};
