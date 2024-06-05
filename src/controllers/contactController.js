const { sendMail } = require("../services/emailService");
exports.contact = async (req, res) => {
    try {
        const htmlEmail = `<html>
        <head>
          <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.3.1/dist/css/bootstrap.min.css" integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous">
        </head>
        <body>
          <div class="container">
            <div class="row justify-content-center">
              <h3 style="color:blue">Sent by ${req.body.email}</h3>
              <h3>Elzen Music</h3>

              <p>${req.body.message}</p>
            </div>
          </div>
        </body>
      </html>`;
        await sendMail(
            "ceqc.quintero@gmail.com",
            `Elzen Music Website: ${req.body.name}`,
            htmlEmail,
        );

        res.send("Correo enviado correctamente.")

    } catch (error) {
        logger.error("Error al enviar el correo:", error);
    }
};