const express = require('express');
const router = express.Router();

const { createDocument, getDocumentById } = require('../controllers/document');
const { auth } = require('../middlewares/auth');

router.post('/documents', auth, createDocument);
router.get('/documents/:id', auth, getDocumentById);

module.exports = router;