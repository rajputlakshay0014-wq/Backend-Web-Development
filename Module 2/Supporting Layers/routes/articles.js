const express = require('express');

const router = express.Router();

const {
  createArticle,
  updateArticle
} = require('../validators/article.validator');

const validateRequest = require('../utils/validateRequest');
const asyncHandler = require('../utils/asyncHandler');

const ctrl = require('../controllers/articlesController');

router.get('/', asyncHandler(ctrl.list));

router.post(
  '/',
  createArticle,
  validateRequest,
  asyncHandler(ctrl.create)
);

router.patch(
  '/:id',
  updateArticle,
  validateRequest,
  asyncHandler(ctrl.update)
);

module.exports = router;