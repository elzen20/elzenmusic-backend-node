const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2022-08-01",
  });

  exports.createPaymentIntent = async (amount, currency) => {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency,
        automatic_payment_methods: { enabled: true },
      });
      return paymentIntent;
    } catch (error) {
      throw error;
    }
  };