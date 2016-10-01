# wx-pager

将 `wx` 后缀文件生成 `wx-app` 的 `page` 所需要的 `wxml`, `js`, `wxss`, `json` 文件内容以及文件。

类似于 `Vue.js` 的 `.vue` 文件。

## 基本使用

```js
var pager = require('wx-pager')

// render 传入文件内容
var output = pager.render(content, {
  filename: filename
})
// renderFile 传入 filename
var output = pager.renderFile(filename)

// output
// {template: {content: ''}, script: {content: ''}, style: {content: ''}, config: {content: ''}}

// 生成各种后缀文件
pager.renderToFiles(filename, {
  output: outputDir
})
```

## API


* `var output = pager.compile('string of wx', options)`

* `var output = pager.render('string of wx', options)`

* `var output = pager.renderFile('filename.wx', options)`

上边的三个返回的结果 `output` 都是这样结构：

```js
{
  template: {content: ''},
  script: {content: ''},
  style: {content: ''},
  config: {content: ''}
}
```

* `pager.renderToFiles('filename.wx', options)`

  这个会在 `options.output` 目录下（默认文件所在目录）生成对应的 `wxml`, `js`, `wxss`, `json` 文件

### Options

* `filename`  如果是 `compile` 或 `render` 的时候，且 `options.cache` 为 `true` 的时候必须

* `cache`  是否缓存

* `output`  当调用 `renderToFiles` 的时候传入，可选参数；表示生成文件时的目录


## License

MIT
