var fs = require('fs')
var path = require('path')
var expect = require('chai').expect

var pager = require('../lib/pager')

describe('wx-pager', function () {

  var srcDir = path.resolve(__dirname, './fixtures')
  var outputDir = path.resolve(__dirname, './output')

  function getSrcFile (file, cb) {
    var filename = path.resolve(srcDir, file)
    fs.readFile(filename, 'utf-8', function (err, data) {
      cb(data, filename)
    })
  }
  function getFile (file, cb) {
    fs.readFile(path.resolve(outputDir, file), 'utf-8', function (err, data) {
      expect(err).to.not.exist
      cb(data)
    })
  }

  it('basic', function (done) {
    getSrcFile('basic.wx', function (content, filename) {
      var check = function (output) {
        expect(output.template.content).to.contain('<view class="view">\n  <text>content</text>\n</view>')
        expect(output.script.content).to.contain('Page({\n  onReady: function () {\n    console.log(\'ready\')\n  }\n})')
        expect(output.style.content).to.contain('.view {\n  color: red;\n}')
        expect(output.config.content).to.contain('{\n  "navigationBarTitleText": "画布"\n}')
      }
      var output = pager.render(content, {
        filename: filename
      })
      check(output)

      output = pager.renderFile(filename)
      check(output)

      pager.renderToFiles(filename, {
        output: outputDir
      })
      var asyncOutput = {
        template: {},
        script: {},
        style: {},
        config: {}
      }
      var checkAll = function () {
        var allChecked = true
        for (var k in asyncOutput) {
          if (!asyncOutput[k].content) {
            allChecked = false
          }
        }
        if (allChecked) {
          check(asyncOutput)
          done()
          asyncOutput = null
        }
      }
      getFile('basic.wxml', function (content) {
        asyncOutput.template.content = content
        checkAll()
      })
      getFile('basic.js', function (content) {
        asyncOutput.script.content = content
        checkAll()
      })
      getFile('basic.wxss', function (content) {
        asyncOutput.style.content = content
        checkAll()
      })
      getFile('basic.json', function (content) {
        asyncOutput.config.content = content
        checkAll()
      })
    })
  })

  it('empty', function (done) {
    getSrcFile('empty.wx', function (content, filename) {
      var output = pager.render(content, {
        filename: filename
      })
      expect(output.template.content).to.not.exist
      expect(output.script.content).to.not.exist
      expect(output.style.content).to.not.exist
      expect(output.config.content).to.not.exist
      done()
    })
  })

  it('muti', function (done) {
    getSrcFile('muti.wx', function (content, filename) {
      pager.render(content, {
        filename: filename
      }, function (err) {
        expect(err).to.exist
        done()
      })
    })
  })

})
