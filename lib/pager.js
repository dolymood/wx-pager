var fs = require('fs')
var ospath = require('path')
var parse = require('./parser')

exports.cache = {}

function handle (options, str) {
  var key = options.filename
  if (options.cache && exports.cache[key]) {
    return exports.cache[key]
  } else {
    if (str === undefined) {
      str = fs.readFileSync(options.filename, 'utf8')
    }
    var templ = exports.compile(str, options)
    if (options.cache) exports.cache[key] = templ
    return templ
  }
}

exports.compile = function (str, options) {
  return parse(str, options)
}

exports.render = function (str, options, fn) {
  // support callback API
  if ('function' == typeof options) {
    fn = options
    options = undefined
  }
  if (typeof fn === 'function') {
    var res
    try {
      res = exports.render(str, options)
    } catch (ex) {
      return fn(ex)
    }
    return fn(null, res)
  }

  options = options || {}

  // cache requires .filename
  if (options.cache && !options.filename) {
    throw new Error('the "filename" option is required for caching')
  }

  return handle(options, str)
}

exports.renderFile = function (path, options, fn) {
  // support callback API
  if ('function' == typeof options) {
    fn = options
    options = undefined
  }
  if (typeof fn === 'function') {
    var res
    try {
      res = exports.renderFile(path, options)
    } catch (ex) {
      return fn(ex)
    }
    return fn(null, res)
  }

  options = options || {}

  options.filename = path
  return handle(options)
}

var extsMap = {
  template: '.wxml',
  script: '.js',
  style: '.wxss',
  config: '.json'
}

exports.renderToFiles = function (path, options, fn) {
  if ('function' == typeof options) {
    fn = options
    options = undefined
  }
  if (typeof fn === 'function') {
    try {
      exports.renderToFiles(path, options)
    } catch (ex) {
      return fn(ex)
    }
    return fn(null, true)
  }

  options = options || {}

  options.filename = path
  var ret = handle(options)
  var content
  var targetOutput
  for (var k in ret) {
    content = ret[k].content
    if (content) {
      content = content.replace(/\/\/[^\n]*/g, '').replace(/^\n*|\n*$/g, '')
      if (options.output) {
        targetOutput = ospath.resolve(options.output, ospath.basename(options.filename).replace('.wx', extsMap[k]))
      } else {
        targetOutput = options.filename.replace('.wx', extsMap[k])
      }
      fs.writeFileSync(targetOutput, content, 'utf8')
    }
  }
  return true
}
