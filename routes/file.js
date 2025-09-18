const express = require('express');
const router = express.Router();

const {uploadFile, getFileById, listFiles, deleteFile} = require('../controllers/file');

const { auth } = require('../middlewares/auth');

const File = require('../models/File');

router.post('/files/upload', auth, uploadFile);
router.get('/files/:id', auth, getFileById);
router.get('/files/list-files', auth, listFiles);
router.delete('/files/delete/:id', auth, deleteFile);

module.exports = router;