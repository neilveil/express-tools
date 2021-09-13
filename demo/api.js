const { $express, _validate, $joi, _r } = require('express-tools')

const router = $express.Router()
module.exports = router

// http://localhost:8080/api/test?name=abc

router.get(
  // Route
  '/test',

  // Validator
  (req, res, next) =>
    _validate(req, res, next, {
      name: $joi.string().min(3).required()
    }),

  // Controller
  (req, res) => _r.success({ req, res, message: 'Hey there!' })
)
