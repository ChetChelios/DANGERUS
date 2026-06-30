const express = require('express');
const router = express.Router();
const c = require('../controllers/solicitudController');
const { requiereAutenticacion } = require('../middleware/authMiddleware');

router.use(requiereAutenticacion);
router.post('/', c.crear);
router.get('/mis', c.misSolicitudes);
router.get('/revisar', c.paraRevisar);
router.put('/:id/responder', c.responder);

module.exports = router;
