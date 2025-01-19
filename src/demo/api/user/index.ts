import { Router } from '@/index'

const router = Router()

router.get('/', (req, res) => {
  res.send('Hi')
})

export default router
