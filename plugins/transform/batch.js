// https://github.com/uhop/stream-json/wiki/Batch
// https://github.com/uhop/stream-json/wiki/Stringer
const Batch = require('stream-json/utils/Batch')
const StreamArray = require('stream-json/streamers/StreamArray')
const {chain} = require('stream-chain')
const fs = require('fs')
const sanitizeHtml = require('sanitize-html')
const minify = require('html-minifier').minify
const {stringer} = require('stream-json/Stringer');

const pipeline = chain([
  fs.createReadStream('./data.json'),
  StreamArray.withParser(),
  new Batch({batchSize: 10})
])

// count all odd values from a huge array
let oddCounter = 0
pipeline.on('data', rows => {
  rows.forEach( (row, index) => {
    (row.key % 2) && ++oddCounter
    rows[index].value['내용(HTML)'] = tidySanitizeMinifyHtml(row.value['내용(HTML)'])
  })
  return rows
})
pipeline.on('end', data => {
  console.log('Odd numbers:', oddCounter)
})

/**
 * 소독, 정리한 HTML 문자열을 얻는다.
 * @see 엑셀 문자열 길이 제한(32767) https://support.microsoft.com/en-us/office/excel-specifications-and-limits-1672b34d-7043-467e-8e27-269d656771c3?ui=en-us&rs=en-us&ad=us#ID0EBABAAA=Excel_2016-2013
 * @param {string} html
 * @returns {string} cleaned
 */
function tidySanitizeMinifyHtml(srcHtml) {
  let cleaned = ''
  try {
    cleaned = sanitizeHtml(srcHtml, {
      allowedTags: sanitizeHtml.defaults.allowedTags
        .concat(['img'])
        .filter(item => !['html', 'head', 'title', 'body', 'span'].includes(item))
    })
    cleaned = minify(cleaned, { collapseWhitespace: true, removeComments: true }).replaceAll(/\t|\r\n|\n|\r/g,'')
  } catch (err) {
    console.error(err)
  } finally {
    return cleaned
  }
}
