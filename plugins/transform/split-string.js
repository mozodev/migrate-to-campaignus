const fs = require('fs')
const data = JSON.parse(fs.readFileSync(`/home/ubuntu/source/sungsan21/build/sungsan21/20220620/extract/공지사항.json`, 'utf8'))

// console.log(data[0])
data.forEach(row => {
  let cat = splitCatFromTitle(row['제목'])
  console.log(cat)
})

function splitCatFromTitle(str) {
  let chunks = str.split(']'), title = str, category = '공고'
  if (chunks.length > 1) {
    category = chunks[0].replace('[', '')
    title = chunks[1].trim()
  }
  return `${category},${title}`
}
