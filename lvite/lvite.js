const Koa = require('koa')
const app = new Koa()
const path = require('path')
const fs = require('fs')
const compile = require('@vue/compiler-sfc')
const compileDom = require('@vue/compiler-dom')
app.use(async ctx => {
  const { url, query} = ctx.request
  if (url === '/') {

    ctx.type = "text/html"
    ctx.body = rewriteImport(fs.readFileSync(path.join(__dirname, './index.html'), 'utf8'))
    
  } else if (url.endsWith('js')) {

    const p = path.join(__dirname, url)
    ctx.type = "application/javascript"
    ctx.body = rewriteImport(fs.readFileSync(p, 'utf8'))

  } else if (url.startsWith('/@modules/')) {

    const moudleName = url.replace('/@modules/', '')
    const prefix = path.join(__dirname, '../node_modules', moudleName)
    const module = require(prefix + '/package.json').module
    const ret = fs.readFileSync(path.join(prefix, module), 'utf8')
    ctx.type = "application/javascript"
    ctx.body = rewriteImport(ret)

  } else if (url.includes(".vue")) {
    const p = path.join(__dirname, url.split("?")[0])
    const ret = compile.parse(fs.readFileSync(p, 'utf8'))
    if (!query.type) {
      const scriptContent = ret.descriptor.script.content
      const scirpt = scriptContent.replace('export default', "const __script=")
      ctx.type = "application/javascript"
      ctx.body = `
        ${rewriteImport(scirpt)}
        import {render as __render} from '${url}?type=template'
        __script.render = __render
        export default __script
      `
    } else if (query.type === "template") {
      const tpl = ret.descriptor.template.content
      const render = compileDom.compile(tpl, { mode: "module" }).code
        ctx.type = "application/javascript"
      ctx.body = rewriteImport(render)
    } 
  }
})

function rewriteImport(content) {
  return content.replace(/from ['"](.*)['"]/g, (s1, s2) => {
    if (s2.startsWith('./') || s2.startsWith('../') || s2.startsWith('/')) {
      return s1
    } else {
      // console.log(s2)
      return `from '/@modules/${s2}'`
    }
  })
}
app.listen(3001, () => {
  console.log("lvite startup!!")
})