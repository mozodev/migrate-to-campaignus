/*
const http = require('follow-redirects').http
const https = require('follow-redirects').https

let url = 'http://cfile215.uf.daum.net/image/13151C104BD5B4B415DBED2'
let client = (url.protocol == "https:") ? https : http
const req = client.get(url, (res) => {
    if (res.statusCode == '200') {
        res.pipe(fs.createWriteStream(`${targetDir}/${filename}`))
    }
    console.log(res.headers['content-type'], res.statusCode)

}).on('error', error => console.error)
filename = `${Date.now()}${ext}`
console.log(filename)
*/

const fs = require('fs')
const minify = require('html-minifier').minify
const sanitizeHtml = require('sanitize-html')
const tidy = require('htmltidy2').tidy

let output = ''
// http://www.npcn.or.kr/gathering/62874
// let document_srl = 62874
// http://www.npcn.or.kr/magazine/7360
let document_srl = 7360
const data = fs.readFileSync(`./${document_srl}.html`, 'utf8')
try {
  output = sanitizeHtml(data, {
    allowedTags: sanitizeHtml.defaults.allowedTags
      .concat([ 'img' ])
      .filter(item => ! ['html', 'head', 'title', 'body', 'span'].includes(item))
  })
  tidy(output, { doctype: '', hideComments: true, indent: false }, function(err, html) {
    output = html
  })
  output = minify(output, { collapseWhitespace: true, removeComments: true }).replaceAll(/\t|\n/g,'')
  console.log(output)
  fs.writeFileSync(`./${document_srl}-cleaned.html`, output)
  let imgSrcs = output.match(/<img [^>]*src="[^"]*"[^>]*>/gm).map(x => x.replace(/.*src="([^"]*)".*/, '$1'))
  console.log(imgSrcs)
} catch (err) {
  console.error(err)
}

// HTML 파싱해서 img.src 배열 준비
const HTMLParser = require('node-html-parser')
const doc = HTMLParser.valid(output) ? HTMLParser.parse(output) : ''
const imgs = doc ? doc.getElementsByTagName('img') : []
const imgSrcs = Array.prototype.map.call(imgs, img => img.getAttribute('src'))

// let imgSrcs = output.match(/<img [^>]*src="[^"]*"[^>]*>/gm).map(x => x.replace(/.*src="([^"]*)".*/, '$1'))
// console.log(imgSrcs)

function extractImgSrcs (html) {
  const urlencode = require('urlencode')
  let rows = []
  let imgs = html.match(/<img [^>]*src="[^"]*"[^>]*>/gm)
  if (imgs && imgs.length > 0) {
    let imgSrcs = imgs.map(x => x.replace(/.*src="([^"]*)".*/, '$1'))
    // 이미지 없는 경우 그대로 반환
    if (!(imgSrcs && imgSrcs.length > 0)) return rows
    // urldecode한 URL을 배열에 추가
    rows = imgSrcs.map(imgSrc => {
      try { // utf8
        return urlencode.decode(imgSrc)
      } catch(e) { // euckr
        return urlencode.decode(imgSrc, 'euckr')
      }
    })
    console.log(rows)
  }
  return rows
}

// test = extractImgSrcs(data)
// const MD5 = require('crypto-js/md5')
// test = 'https://s3.ap-northeast-2.amazonaws.com/img.stibee.com/4774_1504790047.jpg'
// console.log(MD5(test).toString())
// cat 62874-cleaned.html | grep -oP 'src="\K[^"]+'


const urlencode = require('urlencode')
var test = '/home/ubuntu/source/sewoon/html/wp-content/uploads/2018/04/%E1%84%89%E1%85%A6%E1%84%8B%E1%85%AE%E1%86%AB%E1%84%80%E1%85%AA%E1%86%BC%E1%84%8C%E1%85%A1%E1%86%BC03.jpg'
console.log(urlencode.decode(test))

let test = [
'http://www.npcn.or.kr/zero/data/newsletter/%BB%E7%BA%BB__CAM01610.jpg',
'http://www.npcn.or.kr/zero/data/newsletter/%BB%E7%BA%BB__DSC_8635.jpg',
'http://www.uircc.or.kr/bbs/data/gallery/%C5%A9%B1%E2%BA%AF%C8%AF_%B8%F0%BD%C3%B4%C2%B1%DB_%BB%E7%C1%F8%28%B1%B8%B9%CC_%C0%CF%BC%B1%B1%B3%29.jpg',
'http://pic2.ohpy.com/up/elbbs/2009/10/16/26847/1345711205/mid_%BB%E7%C1%F8_132.jpg',
'http://pic2.ohpy.com/up/elbbs/2009/10/16/26847/1896407264/mid_%BB%E7%C1%F8_137.jpg',
'http://pic2.ohpy.com/up/elbbs/2009/10/16/26847/391255768/mid_%BB%E7%C1%F8_139.jpg',
'http://www.uircc.or.kr/bbs/data/gallery/%B2%D9%B9%CC%B1%E2_noname01.bmp',
'http://www.uircc.or.kr/bbs/data/gallery/%B2%D9%B9%CC%B1%E2_noname0.bmp',
'http://www.uircc.or.kr/bbs/data2/gallery/%BB%FD%C5%C2%BB%E7%C1%F8%C3%D4%BF%B5_%BD%C7%BD%C05%28%C0%E5%BF%EB%B1%E2%29.jpg',
'http://www.uircc.or.kr/bbs/data/gallery/%B8%B8%BA%B9%B4%EB%B0%A1%B4%C2%B1%E6%28%C0%CC%C3%B6%B1%D4%29.jpg',
'http://www.uircc.or.kr/bbs/data2/gallery/%C8%AD%BE%F6%BB%E7%28%C0%CC%C3%B6%B1%D4%29.jpg',
'http://www.uircc.or.kr/bbs/data2/gallery/%B9%AE%C8%AD%B0%F8%BF%AC%C0%FC_%B1%CD%C7%E2%BF%A1%BC%AD%28%C0%CC%C3%B6%B1%D4%29.jpg',
'http://www.uircc.or.kr/bbs/data/gallery/%B8%B8%BA%B9%B4%EB%C1%A4%BB%F3%BF%A1%BC%AD.JPG',
'http://blogfiles4.naver.net/data1/2004/9/10/35/SV400061%28%C3%E0%BC%D2%29.jpg'
]
const urlencode = require('urlencode')
test.forEach(str => {
console.log(str)
try {
  decode = urlencode.decode(str, 'euckr')
  console.log(decode)
} catch(e) {
  console.error(str + ' ===> ', e)
}
})

const http = require('follow-redirects').http
const fs = require('fs')

const url = 'http://cfile205.uf.daum.net/image/126E570D499BB397C856F8'
const file = fs.createWriteStream('/home/ubuntu/migrate-to-campaignus/test/test.jpg')
http.get(url, res => {
const contentType = res.headers['content-type'] ? res.headers['content-type'].split('/') : ''
if (res.statusCode === '200' && ext !== 'html') {
  // 파일 확장자 없이 반환하는 경우 헤더에서 찾는다.
  if (!ext && contentType) {
      ext = contentType[contentType.length - 1]
      filename = `${MD5(imgSrc)}.${ext}`.toLowerCase()
  }
  // 'no-image': true,
  if ('images' in migrationOptions && migrationOptions.images) {
      res.pipe(fs.createWriteStream(`${targetDir}/${filename}`))
  }
} else {
  filename = ''
}
}).on('error', err => {
  console.error(err)
})

const mysql = require('mysql2')
// create the connection
const con = mysql.createConnection({
  host: '10.148.130.184',
  database: 'npcn',
  user: 'vagrant',
  password: 'vagrant'
})
const rows = con.query("SELECT * FROM xe_member LIMIT 10")
con.end()

function log(rows) {
  console.log(rows.length)
  testrows = rows
  console.log(testrows.length)
}
console.log(rows)

// src = 'http://cfile229.uf.daum.net/image/161FD7434EA9CAFE376340'
// let filename = src.substring(src.lastIndexOf('/') + 1)
// let ext = filename.split('.').pop()
// console.log(filename, ext.length)
