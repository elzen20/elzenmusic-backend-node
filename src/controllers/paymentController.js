const stripeService = require("../services/stripeService");

exports.createPaymentIntent = async (req, res) => {
  try {
    var total = 0;
    req.body[0].requestTabs.forEach((x) => (total += x.price));

    const paymentIntent = await stripeService.createPaymentIntent(
      Math.round(total * 100),
      "MXN"
    );

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
};
