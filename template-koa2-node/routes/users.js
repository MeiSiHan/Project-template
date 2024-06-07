const router = require('koa-router')()
const { userAdd } = require('../controllers/user')
router.prefix('/users')

router.get('/', function (ctx, next) {
  ctx.body = 'this is a users response!'
})

router.get('/bar', function (ctx, next) {
  ctx.body = 'this is a users/bar response'
})
router.post('/add', userAdd)
module.exports = router
