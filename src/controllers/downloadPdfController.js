const { Storage } = require("@google-cloud/storage");
const AdmZip = require("adm-zip");
const fs = require("fs").promises;
const { sendMail } = require("../services/emailService");

const BUCKET_NAME = process.env.BUCKET_NAME;
const KEY_FILE_NAME = process.env.KEY_FILE_NAME;
const FOLDER_NAME = "./tabs";
const ARCHIVE_NAME = "tabs.zip";

const storage = new Storage({
  keyFilename: KEY_FILE_NAME, // Ruta al archivo de credenciales de servicio
});

exports.downloadPDF = async (req, res) => {
  try {
    const { email, requestTabs } = req.body[0];

    if (email !== "") {
      await fs.mkdir(FOLDER_NAME);
      logger.info("Carpeta 'tabs' creada correctamente.");

      const downloadPromises = requestTabs.map(async (requestedTab) => {
        const { fileName } = requestedTab;
        const destFileName = `${FOLDER_NAME}/${fileName}`;
        await storage.bucket(BUCKET_NAME).file(fileName).download({ destination: destFileName });
        logger.info(`Archivo ${fileName} descargado correctamente.`);
      });

      await Promise.all(downloadPromises);

      const zip = new AdmZip();
      zip.addLocalFolder(FOLDER_NAME);
      zip.writeZip(ARCHIVE_NAME);
      logger.info("Archivos comprimidos correctamente.");

      res.download(ARCHIVE_NAME, async (err) => {
        if (err) {
          logger.error("Error al enviar archivo ZIP:", err);
          res.status(500).send("Error al enviar archivo ZIP");
          return;
        }

        logger.info("Archivo ZIP enviado correctamente.");

        try {
          await sendMail(
            email,
            "Estas son sus Tablaturas",
            "Muchas Gracias por su compra",
            `./${ARCHIVE_NAME}`,
            ARCHIVE_NAME
          );

          logger.info("Correo enviado correctamente.");
        } catch (error) {
          logger.error("Error al enviar el correo:", error);
        } finally {
          await cleanup();
        }
      });
    }
  } catch (error) {
    logger.error("Error:", error);
    res.status(500).send("Error al procesar la solicitud");
  }
};

async function cleanup() {
  try {
    await fs.unlink(`./${ARCHIVE_NAME}`);
    logger.info("Archivo ZIP eliminado.");
  } catch (error) {
    logger.error("Error al eliminar el archivo ZIP:", error);
  }

  try {
    await fs.rm(FOLDER_NAME, { recursive: true });
    logger.info("Carpeta eliminada.");
  } catch (error) {
    logger.error("Error al eliminar la carpeta:", error);
  }
}
