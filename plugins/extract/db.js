const mysql = require('mysql')

const db = mysql.createConnection(source.db)
db.connect(err => {
  if (err) throw err
  if (!('adapter' in source && adapter in adapters)) throw 'source adapter invalid.'
})

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
  params.defaultUserName = 'admin'
  if ('boards' in settings && 'defaultUserName' in settings.boards) {
    params.defaultUserName = settings.boards.defaultUserName
  }
  if (template) return ejs.render(template, params)
  return ''
}
