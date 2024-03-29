// Replace '../dist/index' with 'express-tools'
import { $joi, _validate, _r, $express } from '../../dist/index'

const router = $express.Router()
export default router

// GET: http://localhost:8080/api/test?name=NeilVeil
router.get(
  '/test',
  (req, res, next) =>
    _validate.joi(req, res, next, {
      name: $joi.string().min(3).required()
    }),
  (req, res) => {
    const _req: any = req
    const args = _req.bind.args

    _r.success({ req, res, code: 'OK', message: 'Hey ' + args.name + '!' })
  }
)
