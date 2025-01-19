import { Router } from '@/index'
import user from './user'

const router = Router()

router.use('/user', user)

export default router
