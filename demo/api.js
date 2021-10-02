const { $express, $joi, _validate, _r, _eta } = require('express-tools')

const router = $express.Router()
module.exports = router

// http://localhost:8080/api/test?name=abc
router.get(
  '/test',
  (req, res, next) =>
    _validate(req, res, next, {
      name: $joi.string().min(3).required()
    }),
  (req, res) => _r.success({ req, res, message: 'Hey there!' })
)

router.get('/eta', _eta, (req, res) => _r.success({ req, res, message: 'Hey there!' }))
