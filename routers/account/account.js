const Router = require('@koa/router')

const router = new Router()

router.get('/login', async (ctx) => {
    ctx.body = 'login'
}
)

router.get('/register', async (ctx) => {
    ctx.body = 'register'
}
)

module.exports = router