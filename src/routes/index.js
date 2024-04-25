const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const indexController = require('../controllers/indexController');
const configController = require('../controllers/configController');
const downloadPdfController = require('../controllers/downloadPdfController');

router.get('/', indexController.index);
router.get('/config', configController.config);
router.post('/create-payment-intent', paymentController.createPaymentIntent);
router.post('/download-pdf', downloadPdfController.downloadPDF);


module.exports = router;