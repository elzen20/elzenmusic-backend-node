const { SESClient, SendEmailCommand } = require("@aws-sdk/client-ses");

const REGION = process.env.AWS_REGION; // Define la región de AWS
const SENDER_EMAIL = process.env.CLIENT_EMAIL; // Email del remitente verificado

if (!SENDER_EMAIL) {
  throw new Error("SENDER_EMAIL no está configurado en las variables de entorno.");
}

// Configura el cliente SES
const sesClient = new SESClient({ region: REGION });

exports.sendMail = async (emailDestination, subject, htmlEmail, textEmail = htmlEmail.replace(/<\/?[^>]+(>|$)/g, "")) => {
  try {
    // Configura los parámetros del correo electrónico
    const params = {
      Destination: {
        ToAddresses: [emailDestination], // Direcciones de correo electrónico destinatarias
      },
      Message: {
        Body: {
          Html: {
            Charset: "UTF-8",
            Data: htmlEmail,
          },
          Text: {
            Charset: "UTF-8",
            Data: textEmail, // Convierte HTML a texto plano
          },
        },
        Subject: {
          Charset: "UTF-8",
          Data: subject,
        },
      },
      Source: SENDER_EMAIL, // Dirección de correo electrónico remitente verificada
    };

    // Envía el correo
    const command = new SendEmailCommand(params);
    const result = await sesClient.send(command);
    return result;
  } catch (error) {
    console.error("Error al enviar correo:", error);
    throw error;
  }
};
