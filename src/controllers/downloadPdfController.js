const { Storage } = require("@google-cloud/storage");
const AdmZip = require("adm-zip");
const fs = require("fs");
const { sendMail } = require("../services/emailService");

const BUCKET_NAME = process.env.BUCKET_NAME;
const KEY_FILE_NAME = process.env.KEY_FILE_NAME;

// Crea una instancia de Storage
const zip = new AdmZip();
const storage = new Storage({
  keyFilename: KEY_FILE_NAME, // Ruta al archivo de credenciales de servicio
});
exports.downloadPDF = async (req, res) => {
  try {
    if (req.body[0].email !== "") {
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
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Error al procesar la solicitud");
  }
};
