const sanitizeHtml = require('sanitize-html')
const minify = require('html-minifier').minify

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
    console.log('tidySanitizeMinifyHtml!')
  } catch (err) {
    console.error(err)
  } finally {
    return cleaned
  }
}

// let document_srl = 64413
// const data = fs.readFileSync(`./${document_srl}.html`, 'utf8')
// let test = tidySanitizeMinifyHtml(data)
// console.log(test)
