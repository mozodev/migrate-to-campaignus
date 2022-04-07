const mysql = require('mysql');
const yaml = require('js-yaml');
const fs = require('fs');
const excel = require('exceljs');
const { exit } = require('process');
const ejs = require('ejs');
const HTMLParser = require('node-html-parser');
const path = require('path');
const http = require('follow-redirects').http;
const https = require('follow-redirects').https;
const MD5 = require("crypto-js/md5");

// 설정
let { config, columns, boards, images } = getConfig();
let webRoot = config.source.webroot;
let imagePrefix = images['prefix'];
let patterns = images.patterns;

function getConfig() {
  let configs = {};
  const configDir = `${process.cwd()}/config/`;
  fs.readdirSync(configDir).forEach(file => {
    if (path.parse(file).ext == '.yml' | path.parse(file).ext == 'yaml') {
      configs[path.parse(file).name] = yaml.load(fs.readFileSync(`${configDir}/${file}`, 'utf8'));
    }
  });
  return configs;
}
let siteCode = config.destination['site_code'];
let buildPath = `${config.destination['build']}/${Date.now()}`;
if (!fs.existsSync(`${buildPath}/${siteCode}`)){
  fs.mkdirSync(`${buildPath}/${siteCode}`, {recursive: true});
  fs.writeFile(`${buildPath}/output.log`, '', err => console.error);
  fs.writeFile(`${buildPath}/error.log`, '', err => console.error);
}

// log stdout, stderr.
process.stdout.write = function(str, encoding, fg) {
  fs.appendFile(`${buildPath}/output.log`, str, function(err) {});
}
process.stderr.write = function(str, encoding, fg) {
  fs.appendFile(`${buildPath}/error.log`, str, function(err) {});
}

function getQuery(adapter, name, data = {}) {
  let path = `${process.cwd()}/adapters/${adapter}/${name}.sql`;
  if (template = fs.readFileSync(path).toString()) {
    return ejs.render(template, data);
  }
  return '';
}

/**
 * 포스트 본문 내 이미지 처리
 * - 본문 내 URL 추출, 파일명 치환, 빌드 디렉토리로 파일 복사
 * - 내부의 경우 파일시스템 복사
 * - 외부의 경우 다운로드
 * @param string str (img.src)
 * @returns string replaced (imweb용 이미지 URL)
 */
function processContentURL(str) {
  const targetPrefix = `https://cdn.imweb.me/upload/${siteCode}`;
  const targetDir = `${buildPath}/${siteCode}`;
  const doc = HTMLParser.valid(str) ? HTMLParser.parse(str) : '';
  let replaced = str, imgs = doc ? doc.getElementsByTagName("img") : [];
  if (imgs && imgs.length > 0) {
    imgs.forEach(img => {
      let src = check = img.getAttribute('src'), filename = search = '';
      try {
        // URL인 경우
        const url = new URL(check);
        // 외부인 경우 다운받아서 현재 타임스탬프를 이름으로 파일을 저장한다.
        if (!url.host.includes('npcn.or.kr')) {
          let client = (url.protocol == "https:") ? https : http;
          let ext = path.extname(src);
          filename = `${Date.now()}${ext}`;
          const req = client.get(url, (res) => {
            if (res.statusCode == '200' && ext != 'html') {
              contentType = res.headers['content-type'] ? res.headers['content-type'].split('/') : '';
              if (!ext && contentType) {
                ext = '.' + contentType[contentType.length - 1];
                filename = `${Date.now()}${ext}`;
              }
              res.pipe(fs.createWriteStream(`${targetDir}/${filename}`));
            } else {
              filename = '';
            }
          }).on('error', error => console.error);
        } else {
          // 내부인 경우 파일 찾아서 복사한다.
          filename = fixFilename(src);
          search = fixPath(src);
          if (filename) copyImageFiles(search, `${targetDir}/${filename}`);
        }
      } catch (e) {
        // URL이 아닌 경우
        if (check && check.includes('files/attach/images/')) {
          filename = fixFilename(src);
          search = fixPath(src);
          copyImageFiles(search, `${targetDir}/${filename}`);
        } else {
          console.error('무시', search, e.toString());
        }
      } finally {
        // 본문 이미지 경로 치환
        if (filename) {
          replaced = replaced.replace(src, `${targetPrefix}/${filename}`);
          patterns.forEach(pattern => replaced = replaced.replace(pattern.search, pattern.replace));
        }
      }
    });
  }
  return replaced;
}
// 이미지 파일들은 여러 개의 폴더가 아닌, 한 개의 폴더에 담아 폴더를 **압축**하여 전달주셔야합니다.
function copyImageFiles(src, dst) {
  fs.copyFile(src, dst, (err) => {
    if (err) console.error(err);
    console.log(`${src} ===> ${dst}`);
  });
}
function fixPath(src) {
  let re = new RegExp(imagePrefix.join("|"),"gi");
  // files/attach/images/10210/248/063/8116281b4c7f6bcee48db2372209914a.jpg
  if (src.startsWith('files/attach/images')) src = './' + src;
  return src.replace(re, webRoot);
}
function fixFilename(src) {
  let filename = src.substring(src.lastIndexOf('/')+1);
  let ext = filename.split('.').pop();
  // 이미지 파일명은 영문, 숫자로 이루어져 있어야 업로드 가능합니다. (한글 파일명 업로드 불가)
  let specialChars = /[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
  if (!/^[\x00-\x7F]*$/.test(filename)||specialChars.test(filename)) {
    // 한글이나 특수문자있는 경우 md5 hash.
    filename = `${MD5(src)}.${ext}`;
    console.log(src, filename);
  }
  // file:///C: 제외
  if (filename.includes('file:')) filename = '';
  return filename;
}

const db = mysql.createConnection(config.source.db);
db.connect(err => {
  if (err) throw err;
  // 1. USERS
  db.query(getQuery('xe1', 'users'), (err, results) => {
    if (err) console.log(err) && exit;
    const users = JSON.parse(JSON.stringify(results));
    if (users) console.log(`1. 회원 -- ${users.length}`);
    let workbook = new excel.Workbook();
    let worksheet = workbook.addWorksheet('회원');
    worksheet.columns = columns.users;
    worksheet.addRows(users);
    workbook.xlsx.writeFile(`${buildPath}/users.xlsx`)
      .then(function() {
        console.log("exported to users.xlsx");
      });
  });

  // 2. BOARDS
  for (const board in boards) {
    let data = {}, categories = [], src = boards[board].src;
    data['mids'] = src.map(src => {
      if (typeof src == 'string') {
        return `'${src}'`;
      } else {
        categories.push(src);
        return `'${Object.keys(src)[0]}'`
      }
    }).join();
    if (Object.keys(categories).length > 0) {
      data['categories'] = categories;
    }
    db.query(getQuery('xe1', 'board', data), (err, results) => {
      if (err) console.log(err) && exit;
      let label = boards[board].label
      const posts = JSON.parse(JSON.stringify(results));
      posts.map(post => post['내용'] = processContentURL(post['내용']));
      if (posts && data.mids) console.log(`2. 게시판: ${label} (${data.mids}) -- ${posts.length}`);
      let workbook = new excel.Workbook();
      let worksheet = workbook.addWorksheet(label);
      worksheet.columns = columns.boards;
      worksheet.addRows(posts);
      workbook.xlsx.writeFile(`${buildPath}/${label}.xlsx`)
        .then(function() {
          console.log(`exported to ${label}.xlsx`);
        });
    });
  }
  db.end(function(err) {
    if (err) console.log('error:' + err.message);
  });
});
