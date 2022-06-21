# 캠페이너스 이전

```
현재 지원 CMS
- xe1

$ cd migrate-to-campainus
$ yarn
# write a migration config file project.yml
$ node . -h
```

## 이전 데이터 형식

- 회원: <https://docs.google.com/spreadsheets/d/1GgWdrKOp_Pr0DRwCOJpG2tOzBDt8PV56/edit#gid=363256712>
- 게시판: <https://docs.google.com/spreadsheets/d/1GgqFyNHKsP7jPt1_S9HaLleifQrKdO3k/edit#gid=1438105002>

```
# show unique file extensions
find . -type f | perl -ne 'print $1 if m/\.([^.\/]+)$/' | sort -u

# get campaignus SITE_CODE
curl -sSL {{ PROJECT_CODE }}.campaignus.me | grep SITE_CODE
```
