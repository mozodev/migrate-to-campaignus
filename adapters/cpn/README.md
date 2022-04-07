# 캠페이너스

현재 DB 이전 요청 고객에게 아래의 링크를 통해 문의를 받고 있습니다.

<https://form.campaignus.do/db-migration>

DB 추출과 가공을 위해 더 필요한 정보가 있으시면 말씀 부탁드립니다.
참고로 고객의 FTP 정보는 견적 결제 후 받고 있습니다.

게시글 DB, 회원 DB 및 사진파일을 아임웹에 전달하여 업로드 진행하게 됩니다.
참고로 DB 이전과 관련 고객에게 드리는 정보는 아래와 같습니다.

DB 이전 도움말
- https://help.campaignus.me/article/363-db-migration
- https://nuguna.notion.site/DB-process-880980f851f2472ea405abc8c95990b7

고객이 직접 DB 이전을 하기 원하실 때 안내 사항
https://nuguna.me/DB_migration


## test instance

캠페이너스 테스트사이트 개설정보는 아래와 같습니다. 
테스트 사이트는 대량 사용자 추가를 지원하지 않습니다.

- 샘플판 주소: https://woonjjang.campaignus.me
- 관리자 모드 접속: https://woonjjang.campaignus.me/admin
- 계정(ID): ​woonjjang@ictact.kr
- 임시비밀번호: 1234!
- 사용자 관리 > 목록: https://woonjjang.campaignus.me/admin/member/list
- 컨텐트 관리 > 게시물 관리: https://woonjjang.campaignus.me/admin/contents/post

## 이미지 양식

```
# URL 형식 예시
https://cdn.imweb.me/upload/{{ site_code }}/027e8cb7653a0.png
```

- 이미지 파일들은 여러 개의 폴더가 아닌, 한 개의 폴더에 담아 폴더를 **압축**하여 전달주셔야합니다.
- 이미지 파일명은 영문, 숫자로 이루어져 있어야 업로드 가능합니다. (한글 파일명 업로드 불가)
- 주소에 입력하는 이미지 파일명이 실제 업로드하는 이미지 파일명과 반드시 동일하게 입력해야 합니다.
- **대소문자를 구분하며, 이미지 파일명 앞에 파일경로는 모두 무시됩니다.**
- 이미지 파일명이 동일한 파일들이 있으면 내용과 정확한 매치가 불가합니다.

## 사용자

- `columns/member.{json|yml}`
- 사용자 필드 지정: https://woonjjang.campaignus.me/admin/config/membership/?mode=join
- 사용자 그룹 지정: https://woonjjang.campaignus.me/admin/config/membership/?mode=group

## 게시판 콘텐츠

- `columns/board.{json|yml}`
- 컨텐트 관리 > 게시물 관리: https://woonjjang.campaignus.me/admin/contents/post
