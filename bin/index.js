#!/usr/bin/env node

const yaml = require('js-yaml')
const fs = require('fs')
const excel = require('exceljs')
const { exit } = require('process')
const ejs = require('ejs')
const HTMLParser = require('node-html-parser')
const path = require('path')
const { dirname } = require('path')
const http = require('follow-redirects').http
const https = require('follow-redirects').https
const MD5 = require('crypto-js/md5')
const { Command } = require('commander')
const sanitizeHtml = require('sanitize-html')
const urlencode = require('urlencode')
const minify = require('html-minifier').minify

// 설정
const appRoot = dirname(dirname(require.main.filename))
const adapters = ['campaignus', 'xe1', 'wp']
const outputs = ['xlsx', 'md', 'gsheet']
const models = { 'member': '회원', 'board': '게시판', "page": '페이지', 'post': '포스트' }

// ${migration}.yml 파일을 읽어서 마이그레이션 설정을 반환합니다.
let config, options = {}
let migration = '';

class CustomCommand extends Command {
  createCommand(name) {
    const cmd = new Command(name);
    cmd.description('migrate to campaignus CLI')
    cmd.version('0.1.0')
    cmd.argument('<migration>', 'migration.yml')
    cmd.option('-v, --verbose', 'use verbose logging');
    cmd.hook('preAction', (actionCommand) => {
      config = initConfig(actionCommand.args[0], actionCommand.opts())
    });
    cmd.action((migration, options, command) => {
      console.log(`[${migration}]`, command.name().toUpperCase(), options)
      eval(`${command.name()}()`)
    })
    return cmd;
  }
}

const program = new CustomCommand('migrate2campaignus')
program.command('status')
  .description('Show migration status.')
program.command('extract')
  .description('Extract raw query results from database.')
program.command('transform')
  .description('Transform results to fit campaignus data structure.')
  .option('-i, --images', 'with images')
program.command('load')
  .option('-i, --images', 'with images')
  .description('Load to campaignus xlsx.')
program.parse()

async function status () {
  console.log('status!!!')
}

function initConfig (migrationName, optionVars) {
  config = getMigrationConfig(migrationName)
  options = optionVars
  if (Object.keys(config).length === 0 && config.constructor === Object) {
    console.error('migration config not found or invalid.')
    exit(-1)
  }
  if ('images' in options && options.images) {
    console.log('migration with images...')
  }
  if ('verbose' in options && options.verbose) {
    console.log('verbose...')
    console.log('adapters:', adapters)
    console.log('outputs:', outputs)
    console.log('migration:', migration)
    console.log('options:', options)
  }
  // 표준 출력, 에러를 파일에 기록한다.
  const buildPath = config.buildPath
  const siteCode = config.destination.siteCode
  if (!fs.existsSync(`${buildPath}/${siteCode}`)) {
    fs.mkdirSync(`${buildPath}/${siteCode}`, { recursive: true })
    fs.writeFileSync(`${buildPath}/output.log`, '')
    fs.writeFileSync(`${buildPath}/error.log`, '')
  }
  process.stdout.write = function (str, encoding, fg) {
    fs.appendFile(`${buildPath}/output.log`, str, err => { if (err) console.error(err) })
  }
  process.stderr.write = function (str, encoding, fg) {
    fs.appendFile(`${buildPath}/error.log`, str, err => { if (err) console.error(err) })
  }
  return config
}

const { source, settings, board, member, destination, buildPath } = getMigrationConfig(migration)
const { webRoot, adapter } = config.source
const { siteCode } = config.destination
const targetPrefix = `https://cdn.imweb.me/upload/${siteCode}`
const targetDir = `${config.buildPath}/${config.destination.siteCode}`

/**
 * 요청한 어뎁터 설정을 반환한다.
 * @param {string} adapter
 * @returns configs
 */
/*
function getAdapterConfig(adapter) {
  let configs = {}
  if (!adapters.includes(adapter)) return configs
  const configDir = `${appRoot}/adapters/${adapter}`
  fs.readdirSync(configDir).forEach(file => {
    if (path.parse(file).ext == '.yml' | path.parse(file).ext == 'yaml') {
      configs[path.parse(file).name] = yaml.load(fs.readFileSync(`${configDir}/${file}`, 'utf8'))
    }
  })
  return configs
}
*/

/**
 * 명령행에서 넘어온 yml 파일명으로 마이그레이션 설정을 반환한다.
 * @param {string} filename
 * @returns config
 */
function getMigrationConfig (filename) {
  let config = {}
  const filePath = `${process.cwd()}/${filename}.yml`
  if (fs.existsSync(filePath)) {
    config = yaml.load(fs.readFileSync(filePath, 'utf8'))
    if (config) {
      const today = new Date().toISOString().substring(0, 10).replace(/-/g, '')
      config.buildPath = `${config.destination.buildTo}/${config.id}/${today}`
      config.targetPrefix = `https://cdn.imweb.me/upload/${config.destination.siteCode}`
    }
  }
  return config
}

/**
 * 어댑터/모델 SQL 쿼리 템플릿을 치환해서 실제 쿼리를 반환한다.
 * @param {string} name
 * @param {object} params
 * @returns {string} SQL
 */
function getQuery (name, params = {}) {
  const path = `${appRoot}/adapters/${adapter}/${name}.sql`
  const template = fs.readFileSync(path).toString()
  // 원본 작성자 이름이 없는 경우 기본 작성자명을 제공한다.
  params.defaultUserName =  config.settings.board.defaultUserName ?? 'admin'
  if (template) return ejs.render(template, params)
  return ''
}

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

/**
 * 포스트 본문 문자열 처리
 * - 본문 내 URL 추출, 파일명 치환, 빌드 디렉토리로 파일 복사
 * - 내부의 경우 파일시스템 복사, 외부의 경우 다운로드
 * - 불필요한 문자열 제거 -- 엑셀 문자열 길이 제한(32767)
 * @param string str 본문 원본 문자열
 * @returns string replaced 치환한 문자열
 */
function processContentURL (str) {
  // HTML 문자열 소독 및 정리
  let replaced = tidySanitizeMinifyHtml(str)

  // HTML 파싱해서 img.src 배열 준비
  const doc = HTMLParser.valid(replaced) ? HTMLParser.parse(replaced) : ''
  const imgs = doc ? doc.getElementsByTagName('img') : []

  // 이미지 없는 경우 그대로 반환
  if (!(imgs && imgs.length > 0)) return replaced;

  imgs.forEach(img => {
    let imgSrc = img.getAttribute('src')
    try { // utf8
      imgSrc = urlencode.decode(imgSrc)
    } catch(e) { // euckr
      imgSrc = urlencode.decode(imgSrc, 'euckr')
    }

    let filename = ''
    try { // 유효한 URL인지 검사 후 분기
      const url = new URL(imgSrc)
      filename = downloadImage(imgSrc, url)
    } catch (e) { // URL이 아닌 경우
      filename = copyImageFile(imgSrc)
    }

    if (filename) { // 본문 이미지 경로 치환
      // img.src = `${targetPrefix}/${filename}`
      replaced = replaced.replace(imgSrc, `${config.targetPrefix}/${filename}`)
    }
  })

  return replaced
}

/**
 * 파일시스템에 있는 이미지를 대상 디렉토리로 복사한다.
 * @param {*} imgSrc
 * @see 이미지 파일들은 여러 개의 폴더가 아닌, 한 개의 폴더에 담아 폴더를 **압축**하여 전달주셔야합니다.
 */
function copyImageFile (imgSrc) {
  src = fixPath(imgSrc)
  filename = fixFilename(imgSrc)
  let targetDir = `${config.buildPath}/${config.destination.siteCode}`
  dst = `${targetDir}/${filename}`
  console.log(dst)
  // 파일이 있으면 복사 없으면 로그
  if (filename && fs.existsSync(src)) {
    fs.copyFile(src, dst, (err) => {
      if (err) console.error(err)
      if ('verbose' in options && options.verbose) {
        console.log(`${src} ===> ${dst}`)
      }
    })
  } else {
    console.error('[파일없음]', src)
  }
  return filename
}

/**
 * 외부 이미지를 다운받아서 소스 문자열 MD5 해시명으로 대상 파일시스템 위치에 쓴다.
 * @param {*} imgSrc
 */
function downloadImage (imgSrc, url) {
  console.log('downloadImage -- start', filename)
  let filename = ''
  let targetDir = `${config.buildPath}/${config.destination}`
  if (!url.host.includes(host)) {
    const client = (url.protocol === 'https:') ? https : http
    let ext = path.extname(imgSrc)
    filename = `${MD5(imgSrc)}${ext}`.toLowerCase()
    client.get(url, (res) => {
      const contentType = res.headers['content-type'] ? res.headers['content-type'].split('/') : ''
      if (res.statusCode === '200' && ext !== 'html') {
        // 파일 확장자 없이 반환하는 경우 헤더에서 찾는다.
        if (!ext && contentType) {
          ext = contentType[contentType.length - 1]
          filename = `${MD5(imgSrc)}${ext}`.toLowerCase()
        }
        // --image
        if ('images' in options && options.images) {
          res.pipe(fs.createWriteStream(`${targetDir}/${filename}`))
        }
      } else {
        filename = ''
      }
    }).on('error', error => {
      console.error('[404|외부URL]', label, '|', title, '|', url.toString(), error.toString())
    })
  } else {
    // 내부인 경우 파일 찾아서 복사한다.
    filename = copyImageFile(imgSrc)
  }
  console.log('downloadImage -- end', filename)
  return filename
}

/**
 * 원본 파일시스템에서 소스 파일을 찾을 수 있도록 경로를 바로잡는다.
 * @param {string} src
 * @returns {string} fixed
 */
function fixPath (src) {
  let fixed = src;
  // URL을 파일 시스템 웹루트로 치환하기 전에 문자열을 지정한 패턴으로 수정한다.
  if ('images' in config.settings && 'replace' in config.settings.images) {
    const replacePatterns = config.settings.images.replace
    replaceRe = new RegExp(Object.keys(replacePatterns).join('|'))
    fixed = fixed.replace(replaceRe, match => replacePatterns[match])
  }
  const prefixRe = new RegExp(config.settings.images.prefix.join('|'))
  fixed = fixed.replace(prefixRe, config.source.webRoot)
  return fixed
}

/**
 * build 파일시스템에 복사하기 전에 파일명으로 사용할 MD5 해시를 반환한다.
 * @param {string} src
 * @returns {string} filename
 * @see 이미지 파일명은 영문, 숫자로 이루어져 있어야 업로드 가능합니다. (한글 파일명 업로드 불가)
 */
function fixFilename (src) {
  let filename = src.substring(src.lastIndexOf('/') + 1)
  let ext = filename.split('.').pop()
  if (ext.length > 3) { ext = '' }
  if (!ext) { ext = 'jpg' }
  if (ext.toLowerCase() === 'jpeg') { ext = 'jpg' }
  filename = `${MD5(src)}.${ext}`.toLowerCase()
  // ..jpg => .jpg
  filename = filename.replace('..', '.')
  // file:///C: 제외
  if (filename.includes('file:')) filename = ''
  // 지원하지 않는 확장자는 제외
  if (!ext.toLowerCase() in ['png', 'jpg', 'gif']) filename = ''
  // --verbose
  if ('verbose' in options && options.verbose) {
    console.log(src, filename)
  }
  return filename
}

/**
 * 모델 템플릿 엑셀 파일을 마이그레이션 대상 이름으로 복사합니다.
 * @param {string} model [member|board]
 * @param {string} item board[item]
 */
function copyFromTemplate (model, item = '') {
  if (!['board', 'member'].includes(model)) return ''
  const label = item ? item : models[model]
  const src = `${appRoot}/adapters/campaignus/templates/${model}.xlsx`
  const dst = `${config.buildPath}/${label}.xlsx`
  fs.copyFile(src, dst, (err) => {
    if (err) console.error(err)
    if ('debug' in options && options.debug) {
      console.log(`${src} was copied to ${dst}`)
    }
  })
  return dst
}

/**
 * Get model rows from db
 * @param {string} model [member|board|post]
 * @param {string} item board[item]
 * @return {array} rows
 */
async function extractRows (model, item = '', params = []) {
  const mysql = require("mysql2/promise")
  let dsn = config.source.db
  delete dsn.type
  const db = await mysql.createConnection(dsn)
  fs.mkdirSync(`${config.buildPath}/extract`, { recursive: true })
  const dst = `${config.buildPath}/extract/${item ? item : model}.json`
  let queryName = 'type' in params ? params['type'] : model;
  const [rows] = await db.query(getQuery(queryName, params))
  if (rows && Object.entries(rows).length > 0) {
    // 빌드 패스에 템플릿 파일을 ${model}.xlsx 복사.
    copyFromTemplate(model, item)
    // json 출력
    fs.writeFile(dst, JSON.stringify(rows), err => console.error)
    if (model === 'board') {
      console.log(`게시판:${item} -- 게시물(${rows.length})`)
    } else {
      console.log(`회원 (${rows.length})`)
    }
    db.end()
    return rows
  } else {
    console.error(`${model} -- ${item} no rows`, results)
  }
}

/**
 * HTML에서 이미지 src를 추출해서 json으로 쓴다
 * @param {string} 내용(HTML)
 * @return {array} rows
 */
function extractImgSrcs (html) {
  let rows = []
  let imgs = html.replaceAll(/\t|\n|\r/g,'').match(/<img [^>]*src="[^"]*"[^>]*>/igm)
  if (imgs && imgs.length > 0) {
    let imgSrcs = imgs.map(x => x.replace(/.*src="([^"]*)".*/, '$1'));
    if (imgSrcs && imgSrcs.length > 0) {
      // urldecode한 URL을 배열에 추가
      rows = imgSrcs.map(imgSrc => {
        try { // utf8
          return urlencode.decode(imgSrc)
        } catch(e) { // euckr
          return urlencode.decode(imgSrc, 'euckr')
        }
      })
    }
  }
  return new Promise((resolve, reject) => resolve(rows))
}


/**
 * Get model rows from json
 * @param {string} model [member|board|post]
 * @param {string} item board[item]
 * @return {array} rows
 */
function getRows (model, item = '', image = false) {
  const dst = `${config.buildPath}/extract/${(image) ? 'images/' : ''}${item ? item : model}.json`
  return JSON.parse(fs.readFileSync(dst))
}

/**
 * Write to campaignus xlsx file.
 * @param {string} model [member|board|post]
 * @param {array} rows
 * @param {string} item board[item]
 */
function writeToCampaignusXlsx (model, rows, item = '') {
  const label = item ? item : models[model]
  const workbook = new excel.Workbook()
  const dstExcel = `${config.buildPath}/${label}.xlsx`
  try {
    workbook.xlsx.readFile(`${dstExcel}`)
      .then(function () {
        const worksheet = workbook.getWorksheet(1)
        let startRow = 4
        // 복사한 파일 헤더 밑에서부터 결과를 추가한다.
        rows.forEach(row => {
          nextRow = worksheet.getRow(startRow++)
          nextRow.values = Object.values(row)
        })
        console.log(`${label} -- 완료 ${dstExcel}`)
        return workbook.xlsx.writeFile(dstExcel)
      })
  } catch (e) {
    console.error(label, e.toString())
  }
}

async function extract() {
  if ('member' in config) extractRows('member')
  if ('board' in config) {
    for (const [item, params] of Object.entries(config.board)) {
      // 게시글 정보 추출 및 json 출력
      const rows = await extractRows('board', item, params)
      // 게시글 내 이미지 src 추출
      let imgSrcs = []
      await Promise.all(
        rows.map(async row => {
          let srcs = await extractImgSrcs(row['내용(HTML)'])
          if (srcs && srcs.length > 0) {
            console.log(srcs)
            imgSrcs.push(...srcs)
          }
        })
      )
      // 이미지 src json 출력
      if (imgSrcs.length > 0 ) {
        fs.mkdirSync(`${config.buildPath}/extract/images`, { recursive: true })
        const imgDst = `${config.buildPath}/extract/images/${item ? item : model}.json`
        fs.writeFile(imgDst, JSON.stringify(imgSrcs), err => console.error)
        console.log(`게시판:${item} -- 이미지(${imgSrcs.length})`)
      }
    }
  }
}

function processHTML(item, row) {
  console.log(`[extract:img.src] start -- 게시판 -- ${item}`)
  try {
    // 이미지 src 주소 변환
    // 이미지 src json 출력
    fs.mkdirSync(`${config.buildPath}/extract/images`, { recursive: true })
    const dst = `${config.buildPath}/extract/images/${item ? item : model}.json`
    fs.writeFileSync(dst, JSON.stringify(imgSrcs), err => console.error)
    console.log(`[extract:img.src] complete -- 게시판 -- ${item} -- (${imgSrcs.length})`)
  } catch (error) {
    console.log(error);
  }
  return sanitizeHtml
}

async function transform() {
  fs.mkdirSync(`${config.buildPath}/transform/images`, { recursive: true })
  if ('member' in config) {
    const src = `${config.buildPath}/extract/member.json`
    const dst = `${config.buildPath}/transform/member.json`
    fs.copyFileSync(src, dst);
  }
  if ('board' in config) {
    for (const [item, params] of Object.entries(config.board)) {
      const rows = getRows('board', item)
      if (rows && rows.length > 0) {
        console.log(`게시판:${item} -- sanitizeHtmlFromRows -- 본문 문자열 소독 시작`)
        console.time('SanitizeHtml')
        rows.forEach(async (row, index) => {
          // 게시판 본문 문자열 소독
          rows[index]['내용(HTML)'] = await tidySanitizeMinifyHtml(row['내용(HTML)'])
        })
        console.log(`게시판:${item} -- sanitizeHtmlFromRows -- 본문 문자열 소독 완료`)
        console.timeEnd('SanitizeHtml')
        const dst = `${config.buildPath}/transform/${item ? item : model}.json`
        await fs.writeFile(dst, JSON.stringify(rows), err => console.error)
      }
    }
  }
  if ('page' in config) {
  }
  if ('post' in config) {
  }
}

// 이미지 src:파일명 해시 반환 = { "원본 src 문자열": "dstFile (md5hash.ext)", ... }
function buildImgSrcPatterns(item) {
  return new Promise(async (resolve, reject) => {
    try {
      let replacePatterns = {}
      console.log(`게시판:${item} -- 이미지 치환 패턴 시작`)
      imgSrcs = getRows('board', item, true)
      if (imgSrcs && imgSrcs.length > 0) imgSrcs.forEach(src => replacePatterns[src] = fixFilename(src))
      const imgDst = `${config.buildPath}/transform/images/${item}.json`
      fs.writeFile(imgDst, JSON.stringify(replacePatterns), err => console.error)
      console.log(`게시판:${item} -- 이미지 치환 패턴 완료 -- (${Object.keys(replacePatterns).length})`)
      resolve(replacePatterns)
    } catch (e) {
      reject(e)
    }
  })
}

// 게시판 본문 문자열 이미지 src 치환
function replaceSrcs(item, html, replacePatterns) {
  let transformed = ''
  console.log(`${item} -- 본문 문자열 이미지 src 치환 시작`)
  console.time('replaceSrcs')
  let re = new RegExp(Object.keys(replacePatterns).join('|'), 'g');
  transformed = html.replace(re, match => `${config.targetPrefix}/${replacePatterns[match]}`);
  console.log(`${item} -- 본문 문자열 이미지 src 치환 완료`)
  console.timeEnd('replaceSrcs')
  return transformed
}

async function load() {
  // 1. 회원
  fs.mkdirSync(`${config.buildPath}/load/images`, { recursive: true })
  if ('member' in config) {
    rows = getRows('member')
    writeToCampaignusXlsx('member', rows)
  }
  // 2. 게시판
  if (config.board) {
    let rows = []
    for (const label in config.board) {
      const params = config.board[label]
      let rows = getRows('board', label, false)
      // 파일 복사용 목록 json 생성 { src: MD5(src).ext } <=== 모두 다운로드??
      // {item}.json 복사 후 이미지 src 문자열 치환
      rows.map(row => {
        row['내용(HTML)'] = processContentURL(row['내용(HTML)'], label, row['제목'])
        return row['내용(HTML)']
      })
      writeToCampaignusXlsx('board', rows, label)
      console.log(`board -- ${label} 완료`)
    }
  }
}

