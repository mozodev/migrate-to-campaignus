const mysql = require('mysql')
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
const tidy = require('htmltidy2').tidy

// 설정
const appRoot = dirname(dirname(require.main.filename))
const adapters = ['campaignus', 'xe1', 'wp']
const outputs = ['xlsx', 'sql', 'json', 'csv', 'html', 'md', 'txt', 'gsheet']

// ${migration}.yml 파일을 읽어서 마이그레이션 설정을 반환합니다.
let migrationConfig = ''
let migrationOptions = {}
const program = new Command()
program
  .name('migrate2campaignus')
  .description('migrate to campaignus CLI')
  .version('0.1.0')
  .argument('<migration>', 'migration.yml')
  .option('-d, --debug', 'output extra debugging')
  .option('-I, --no-images', 'without images')
  .action((migration, options) => {
    migrationConfig = getMigrationConfig(migration)
    migrationOptions = options
    if (Object.keys(migrationConfig).length === 0 && migrationConfig.constructor === Object) {
      console.error('migration config not found or invalid.')
      exit(-1)
    }
    if (!('images' in options && options.images)) {
      console.log('migration without images...')
    }
    if ('debug' in options && options.debug) {
      console.log('debug mode on!')
      console.log('adapters:', adapters)
      console.log('outputs:', outputs)
      console.log('migration:', migration)
      console.log('options:', options)
    }
    console.log(`${migrationConfig.buildPath}/output.log`)
    console.log(`${migrationConfig.buildPath}/error.log`)
  })
  .parse()

const { source, images, boards, members, destination } = migrationConfig
const webRoot = source.webRoot
const siteCode = destination.siteCode

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
      const now = new Date(Date.now())
      const nowDate = new Date().toISOString().substring(0, 10).replace(/-/g, '')
      const nowTime = now.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit' }).replace(/:/g, '')
      config.buildPath = `${config.destination.build}/${config.id}/${nowDate}-${nowTime}`
    }
  }
  return config
}

// 표준 출력, 에러를 파일에 기록한다.
if (!fs.existsSync(`${migrationConfig.buildPath}/${siteCode}`)) {
  fs.mkdirSync(`${migrationConfig.buildPath}/${siteCode}`, { recursive: true })
  fs.writeFile(`${migrationConfig.buildPath}/output.log`, '', err => {
    if (err) { console.error(err) }
  })
  fs.writeFile(`${migrationConfig.buildPath}/error.log`, '', err => {
    if (err) { console.error(err) }
  })
}
process.stdout.write = function (str, encoding, fg) {
  fs.appendFile(`${migrationConfig.buildPath}/output.log`, str, err => { if (err) console.error(err) })
}
process.stderr.write = function (str, encoding, fg) {
  fs.appendFile(`${migrationConfig.buildPath}/error.log`, str, err => { if (err) console.error(err) })
}

/**
 * 어댑터/모델 SQL 쿼리 템플릿을 치환해서 실제 쿼리를 반환한다.
 * @param {string} adapter
 * @param {string} name
 * @param {object} data
 * @returns {string} SQL
 */
function getQuery (adapter, name, data = {}) {
  const path = `${appRoot}/adapters/${adapter}/${name}.sql`
  const template = fs.readFileSync(path).toString()
  if (template) {
    return ejs.render(template, data)
  }
  return ''
}

/**
 * 포스트 본문 문자열 처리
 * - 본문 내 URL 추출, 파일명 치환, 빌드 디렉토리로 파일 복사
 * - 내부의 경우 파일시스템 복사, 외부의 경우 다운로드
 * - 불필요한 문자열 제거 -- 엑셀 문자열 길이 제한(32767)
 * @param string str 본문 원본 문자열
 * @returns string replaced 치환한 문자열
 */
function processContentURL (str, label, title) {
  const targetPrefix = `https://cdn.imweb.me/upload/${siteCode}`
  const targetDir = `${migrationConfig.buildPath}/${siteCode}`
  const doc = HTMLParser.valid(str) ? HTMLParser.parse(str) : ''
  let replaced = str
  const imgs = doc ? doc.getElementsByTagName('img') : []
  if (imgs && imgs.length > 0) {
    imgs.forEach(img => {
      const src = img.getAttribute('src')
      const check = src
      let filename = ''
      let search = ''
      try {
        // URL인 경우
        const url = new URL(check)
        // 외부인 경우 다운받아서 현재 타임스탬프를 이름으로 파일을 저장한다.
        if (!url.host.includes('npcn.or.kr')) {
          const client = (url.protocol === 'https:') ? https : http
          let ext = path.extname(src)
          // 파일명은 소스 문자열 MD5 해시로 지정한다.
          filename = `${MD5(src)}${ext}`
          client.get(url, (res) => {
            // 제발 404 에러 상태 코드 좀!
            if (res.statusCode === '200' && ext !== 'html') {
              // 파일 확장자 없이 반환하는 경우 헤더에서 찾는다.
              const contentType = res.headers['content-type'] ? res.headers['content-type'].split('/') : ''
              if (!ext && contentType) {
                ext = contentType[contentType.length - 1]
                filename = `${MD5(src)}.${ext}`
                filename = filename.toLowerCase()
              }
              // --no-image
              if ('images' in migrationOptions && migrationOptions.images) {
                res.pipe(fs.createWriteStream(`${targetDir}/${filename}`))
              }
            } else {
              filename = ''
            }
          }).on('error', _error => console.error)
        } else {
          // 내부인 경우 파일 찾아서 복사한다.
          filename = fixFilename(src)
          search = fixPath(src)
          // --no-image
          if ('images' in migrationOptions && migrationOptions.images) {
            if (filename) copyImageFiles(search, `${targetDir}/${filename}`)
          }
        }
      } catch (e) {
        // URL이 아닌 경우
        if (check && check.includes('files/attach/images/')) {
          filename = fixFilename(src)
          search = fixPath(src)
          // --no-image
          if ('images' in migrationOptions && migrationOptions.images) {
            copyImageFiles(search, `${targetDir}/${filename}`)
          }
        } else {
          console.error('[무시]', label, '|', title, '|', check, '|' , e.toString())
        }
      } finally {
        // 본문 이미지 경로 치환
        if (filename) {
          replaced = replaced.replace(src, `${targetPrefix}/${filename}`)
        }
      }
    })
  }
  // tidyHtml && sanitizeHtml -- 엑셀 문자열 길이 제한(32767)
  // https://support.microsoft.com/en-us/office/excel-specifications-and-limits-1672b34d-7043-467e-8e27-269d656771c3?ui=en-us&rs=en-us&ad=us#ID0EBABAAA=Excel_2016-2013
  try {
    tidy(replaced, { doctype: '', hideComments: true }, function (err, html) {
      if (err) console.error(err)
      replaced = html
    })
    replaced = sanitizeHtml(replaced, {
      allowedTags: sanitizeHtml.defaults.allowedTags
        .concat(['img'])
        .filter(item => !['html', 'head', 'title', 'body', 'span'].includes(item))
    })
  } catch (err) {
    console.error(err)
  }

  return replaced
}

// 이미지 파일들은 여러 개의 폴더가 아닌, 한 개의 폴더에 담아 폴더를 **압축**하여 전달주셔야합니다.
function copyImageFiles (src, dst) {
  fs.copyFile(src, dst, (err) => {
    if (err) throw console.error(err)
    if ('debug' in migrationOptions && migrationOptions.debug) {
      console.log(`${src} ===> ${dst}`)
    }
  })
}

// 원본 파일시스템에서 소스 파일을 찾을 수 있도록 경로를 바로잡는다.
function fixPath (src) {
  const re = new RegExp(images.prefix.join('|'), 'gi')
  // files/attach/images/10210/248/063/8116281b4c7f6bcee48db2372209914a.jpg
  if (src.startsWith('files/attach/images')) src = './' + src
  return src.replace(re, webRoot)
}

// build 파일시스템에 복사하기 전에 파일명을 MD5 해시로 지정한다.
function fixFilename (src) {
  let filename = src.substring(src.lastIndexOf('/') + 1)
  const ext = filename.split('.').pop()
  // 이미지 파일명은 영문, 숫자로 이루어져 있어야 업로드 가능합니다. (한글 파일명 업로드 불가)
  const specialChars = /[`!@#$%^&*()_+\-=[\]{}':"\\|,.<>/?~]/
  if (!/^[x00-x7F]*$/.test(filename) || specialChars.test(filename)) {
    // 한글이나 특수문자있는 경우 md5 hash.
    filename = `${MD5(src)}.${ext}`
    if ('debug' in migrationOptions && migrationOptions.debug) {
      console.log(src, filename)
    }
  }
  // ..jpg => .jpg
  filename = filename.replace('..', '.')
  // file:///C: 제외
  if (filename.includes('file:')) filename = ''

  return filename.toLowerCase()
}

// board, member 모델 템플릿 엑셀 파일을 마이그레이션 대상 이름으로 복사합니다.
function copyFromTemplate (model, label) {
  if (!['board', 'member'].includes(model)) return ''
  const src = `${appRoot}/adapters/campaignus/templates/${model}.xlsx`
  const dst = `${migrationConfig.buildPath}/${label}.xlsx`
  fs.copyFile(src, dst, (err) => {
    if (err) console.error(err)
    if ('debug' in migrationOptions && migrationOptions.debug) {
      console.log(`${src} was copied to ${dst}`)
    }
  })
  return dst
}

const db = mysql.createConnection(source.db)
db.connect(err => {
  if (err) throw err

  // 1. members
  if (members) {
    db.query(getQuery('xe1', 'members'), (err, results) => {
      if (err) console.log(err) && exit()
      const members = JSON.parse(JSON.stringify(results))
      if (Array.isArray(members) && members.length > 0) {
        console.log(`1. 회원 -- ${members.length}`)
        // 빌드 패스에 템플릿 파일을 회원.xlsx 복사.
        const dstExcel = copyFromTemplate('member', '회원')
        const workbook = new excel.Workbook()
        workbook.xlsx.readFile(dstExcel)
          .then(function () {
            const worksheet = workbook.getWorksheet(1)
            let startRow = 4
            // 복사한 파일 헤더 밑에서부터 결과를 추가한다.
            members.forEach(member => {
              const nextRow = worksheet.getRow((startRow)++)
              nextRow.values = Object.values(member)
            })
            console.log(`exported to ${dstExcel}`)
            return workbook.xlsx.writeFile(dstExcel)
          })
      }
    })
  }

  // 2. BOARDS
  if (boards.mappings) {
    for (const board in boards.mappings) {
      const data = {}
      const categories = []
      const src = boards.mappings[board].src
      // src에 mid:category_id 쌍이 있는 경우
      data.mids = src.map(src => {
        if (typeof src === 'string') {
          return `'${src}'`
        } else {
          categories.push(src)
          return `'${Object.keys(src)[0]}'`
        }
      }).join()
      if (Object.keys(categories).length > 0) {
        data.categories = categories
      }
      // 원본 작성자 이름이 없는 경우 기본 작성자명을 제공한다.
      data.defaultUserName = 'admin'
      if ('defaultUserName' in boards) {
        data.defaultUserName = boards.defaultUserName
      }
      db.query(getQuery('xe1', 'board', data), (err, results) => {
        if (err) console.log(err) && exit(-1)
        const label = boards.mappings[board].label
        // 빌드 패스에 템플릿 파일을 label.xlsx 복사.
        const dstExcel = copyFromTemplate('board', label)
        let posts = {}
        try {
          posts = JSON.parse(JSON.stringify(results))
          posts.map((post) => {
            post['내용(HTML)'] = processContentURL(post['내용(HTML)'], label, post['제목'])
            return post['내용(HTML)']
          })
        } catch (e) {
          console.error(label, e, results)
        }
        if (Array.isArray(posts) && posts.length > 0 && data.mids) {
          console.log(`2. 게시판: ${label} (${data.mids}) -- ${posts.length}`)
          const workbook = new excel.Workbook()
          workbook.xlsx.readFile(dstExcel)
            .then(function () {
              const worksheet = workbook.getWorksheet(1)
              let startRow = 4
              // 복사한 파일 헤더 밑에서부터 결과를 추가한다.
              posts.forEach(post => {
                const nextRow = worksheet.getRow(startRow++)
                nextRow.values = Object.values(post)
              })
              console.log(`exported to ${dstExcel}`)
              return workbook.xlsx.writeFile(dstExcel)
            })
        }
      })
    }
  }

  // End!
  db.end(function (err) {
    if (err) console.log('error:' + err.message)
  })
})
