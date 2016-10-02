// change from https://github.com/vuejs/vue-loader/

var parse5 = require('parse5')
var cache = require('lru-cache')(100)
var hash = require('hash-sum')
var deindent = require('de-indent')
var splitRE = /\r?\n/g
var emptyRE = /^\s*$/

module.exports = function (content, options) {
  var cacheKey = hash(options.filename + content)
  var output = cache.get(cacheKey)
  if (output) return output

  output = {
    template: [],
    style: [],
    script: [],
    config: []
  }

  var fragment = parse5.parseFragment(content, {
    locationInfo: true
  })

  fragment.childNodes.forEach(function (node) {
    var type = node.tagName
    var lang = getAttribute(node, 'lang')

    if (!output[type]) {
      return
    }

    if (output[type].length > 0
    ) {
      throw new Error(
        '[wx-pager] 在 wx 中只能包含一个 <template>、<script> 、<style>、`<config>` 标签'
      )
    }

    if (type === 'template') {
      node = node.content
    }

    if (!node.childNodes || !node.childNodes.length) {
      return
    }

    var start = node.childNodes[0].__location.startOffset
    var end = node.childNodes[node.childNodes.length - 1].__location.endOffset
    var result
    if (type === 'script') {
      result =
        commentScript(content.slice(0, start)) +
        deindent(content.slice(start, end)) +
        commentScript(content.slice(end))
    } else {
      var lineOffset = content.slice(0, start).split(splitRE).length - 1
      result = deindent(content.slice(start, end))

      result = Array(lineOffset + 1).join('\n') + result
    }

    output[type].push({
      lang: lang,
      content: result
    })
  })
  for (var k in output) {
    output[k] = output[k][0] || {}
  }
  cache.set(cacheKey, output)
  return output
}

function commentScript (content) {
  var symbol = getCommentSymbol()
  var lines = content.split(splitRE)
  return lines.map(function (line, index) {
    // preserve EOL
    if (index === lines.length - 1 && emptyRE.test(line)) {
      return ''
    } else {
      return symbol + (emptyRE.test(line) ? '' : ' ' + line)
    }
  })
  .join('\n')
}

function getCommentSymbol () {
  return '//'
}

function getAttribute (node, name) {
  if (node.attrs) {
    var i = node.attrs.length
    var attr
    while (i--) {
      attr = node.attrs[i]
      if (attr.name === name) {
        return attr.value
      }
    }
  }
}
