const express = require("express");
const app = express();
const { resolve } = require("path");
const bodyParser = require("body-parser");
// Replace if using a different env file or config
const env = require("dotenv").config({ path: "./.env" });
const { google } = require("googleapis");
const nodemailer = require("nodemailer");
const { file } = require("googleapis/build/src/apis/file");
const { Storage } = require("@google-cloud/storage");
const AdmZip = require("adm-zip");
const fs = require("fs");

const CLIENT_EMAIL = process.env.CLIENT_EMAIL; //your email from where you'll be sending emails to users
const CLIENT_ID = process.env.CLIENT_ID; // Client ID generated on Google console cloud
const CLIENT_SECRET = process.env.CLIENT_SECRET; // Client SECRET generated on Google console cloud
const REDIRECT_URI = process.env.REDIRECT_URI; // The OAuth2 server (playground)
const REFRESH_TOKEN = process.env.REFRESH_TOKEN; // The refreshToken we got from the the OAuth2 playground
const BUCKET_NAME = process.env.BUCKET_NAME;
const KEY_FILE_NAME = process.env.KEY_FILE_NAME;

// Crea una instancia de Storage
const zip = new AdmZip();
const storage = new Storage({
  keyFilename: KEY_FILE_NAME, // Ruta al archivo de credenciales de servicio
});
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2022-08-01",
});
app.use(bodyParser.json());

app.use(express.static(process.env.STATIC_DIR));

app.get("/", (req, res) => {
  const path = resolve(process.env.STATIC_DIR + "/index.html");
  res.sendFile(path);
});

app.get("/config", (req, res) => {
  res.send({
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
  });
});

app.post("/create-payment-intent", async (req, res) => {
  try {
    var total = 0;
    req.body[0].requestTabs.forEach((x) => (total += x.price));

    const paymentIntent = await stripe.paymentIntents.create({
      currency: "MXN",
      amount: Math.round(total * 100),
      automatic_payment_methods: { enabled: true },
    });

    // Send publishable key and PaymentIntent details to client
    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (e) {
    return res.status(400).send({
      error: {
        message: e.message,
      },
    });
  }
});
app.post("/download-pdf", async (req, res) => {
  try {
    const archivoZip = "tabs.zip";
    const folderName = "./tabs";
    const createFolder = await fs.mkdirSync(folderName);

    const zip = new AdmZip();

    const bucketName = BUCKET_NAME;

    const downloadPromises = req.body[0].requestTabs.map((requestedTab) => {
      const fileName = requestedTab.fileName;
      const destFileName = `./tabs/${fileName}`;
      return storage
        .bucket(bucketName)
        .file(fileName)
        .download({ destination: destFileName });
    });

    await Promise.all(downloadPromises, createFolder);

    zip.addLocalFolder("./tabs");
    async function cleanup() {
      // Eliminar el archivo ZIP
      await fs.unlink(`./${archivoZip}`, (err) => {
        if (err) console.log(err);
        else {
          console.log("\nDeleted file: example_file.txt");

          // Get the files in current directory
          // after deletion
        }
      });
      // Eliminar la carpeta 'tabs' y su contenido
      await fs.rm(folderName, { recursive: true }, () => {
        console.log("Folder Deleted!");

        // Get the current filenames
        // in the directory to verify
      });
      // await Promise.all(deleteZip, deleteFolder);
      console.log("Archivos y carpeta eliminados.");
    }

    // Escribir el archivo ZIP
    zip.writeZip(archivoZip, (error) => {
      if (error) {
        console.error("Error al comprimir archivos:", error);
        res.status(500).send("Error al comprimir archivos");
      } else {
        console.log("Archivos comprimidos correctamente.");

        // Enviar el archivo ZIP como respuesta
        res.download(archivoZip, async (err) => {
          if (err) {
            console.error("Error al enviar archivo ZIP:", err);
            res.status(500).send("Error al enviar archivo ZIP");
          } else {
            console.log("Archivo ZIP enviado correctamente.");
            await sendMail(
              req.body[0].email,
              "Estos son sus Tablaturas",
              "Muchas Gracias por su compra",
              `./${archivoZip}`,
              archivoZip
            );
            await cleanup();
          }
        });
      }
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Error al procesar la solicitud");
  }
});

async function sendMail(email, subject, message, file, fileName) {
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
    console.log(result);
    return result;
  } catch (error) {
    console.log(error);
    return error;
  }
}

app.listen(5252, () =>
  console.log(`Node server listening at http://localhost:5252`)
);
