const router = require('koa-router')()

router.get('/', async (ctx, next) => {
  await ctx.render('index', {
    title: 'Hello Koa 2!'
  })
})

router.get('/string', async (ctx, next) => {
  ctx.body = 'koa2 string'
})

router.get('/json', async (ctx, next) => {
  ctx.body = {
    title: 'koa2 json'
  }
})
//获取get传值
router.get('/newscontent',async(ctx)=>{
  //从ctx中读取get值
  console.log(ctx.query); //获取的是格式化的对象，例｛id:'123'｝
  console.log(ctx.querystring); //获取的是url的字符串 ,例：'id=123'
  console.log(ctx.request); //获取请求相关的信息，包括method,url，header等信息
  ctx.body = '新闻详情';
});
//动态路由 
router.get('/news/:params',async(ctx)=>{
  //aid 为自定义参数名，可以通过ctx.params访问
  //如果有多个动态传值，则可以写成 '/news/:params1/:params2'的形式
  ctx.body = ctx.params;
});
module.exports = router
