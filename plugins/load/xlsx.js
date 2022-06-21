const excel = require('exceljs')
const fs = require('fs')

const workbook = new excel.Workbook()
const rows = []
const label = ''
const appRoot = ''
const buildPath = ''

// 빌드 패스에 템플릿 파일을 label.xlsx 복사.
const dstExcel = copyFromTemplate('board', label)

// DB 결과 파일에 추가
workbook.xlsx.readFile(dstExcel)
  .then(function () {
    const worksheet = workbook.getWorksheet(1)
    let startRow = 4
    // 복사한 파일 헤더 밑에서부터 결과를 추가한다.
    rows.forEach(post => {
      const nextRow = worksheet.getRow((startRow)++)
      nextRow.values = Object.values(post)
    })
    console.log(`exported to ${dstExcel}`)
    return workbook.xlsx.writeFile(dstExcel)
  })

// board, member 모델 템플릿 엑셀 파일을 마이그레이션 대상 이름으로 복사합니다.
function copyFromTemplate (model, label) {
  if (!['board', 'member'].includes(model)) return ''
  const src = `${appRoot}/adapters/campaignus/templates/${model}.xlsx`
  const dst = `${buildPath}/${label}.xlsx`
  fs.copyFile(src, dst, (err) => {
    if (err) throw err
    console.log(`${src} was copied to ${dst}`)
  })
  return dst
}
