-- XE 1 <https://github.com/xpressengine/xe-core>

-- member
-- 그룹, 등급 어떻게?
-- 연락처: 핸드폰 번호?
-- 상세 주소
SELECT
    m.`email_address` AS "E-mail",
    m.`user_id` AS "ID",
    '' AS "비밀번호",
    m.`user_name` AS "이름",
    (SELECT
        GROUP_CONCAT(mg.title separator ',')
    FROM
        xe_member_group_member mgm
        LEFT OUTER JOIN xe_member_group mg ON mgm.group_srl = mg.group_srl
    WHERE
        m.member_srl = mgm.member_srl
    GROUP BY mg.group_srl
    ) AS "회원그룹",
    (SELECT
        GROUP_CONCAT(mg.title separator ',')
    FROM
        xe_member_group_member mgm
        LEFT OUTER JOIN xe_member_group mg ON mgm.group_srl = mg.group_srl
    WHERE
        m.member_srl = mgm.member_srl
    GROUP BY mg.group_srl
    ) AS "회원등급",
    '' AS "성별",
    TRIM(BOTH '"' FROM SUBSTRING_INDEX(REGEXP_SUBSTR(m.extra_vars, 's:9:\"handphone\";s:([0-9]+):\".+?\"'), ":", -1)) AS "연락처",
    m.`homepage` AS "홈페이지",
    '' AS "우편번호",
    '' AS "주소",
    REPLACE(TRIM(BOTH '"' FROM SUBSTRING_INDEX(REGEXP_SUBSTR(m.extra_vars, 's:12:\"home_address\";s:([0-9]+):\".+?\";'), ":", -1)), '";', '') AS "상세주소",
    STR_TO_DATE(m.`birthday`, '%Y%m%d') AS "생년월일",
    '' AS "포인트"
FROM
    xe_member m

-- files
SELECT
	file_srl,
    upload_target_srl,
    uploaded_filename
FROM
    xe_files

-- boards list
SELECT
    module_srl,
    mid,
    browser_title
FROM
    xe_modules
WHERE
    module = "board"

-- all documents of specific board
-- module_srl: 게시판 아이디
-- campaignus_board_id: 캠페이너스 게시판 아이디
SELECT
    "" AS "카테고리ID-",
    SUBSTRING(`title`, 1, 100) AS "제목", 
    `content` AS "내용",
    `user_name` AS "작성자",
    STR_TO_DATE(`regdate`, '%Y%m%d%H%i%s') AS "작성시간",
    `readed_count` AS "조회수",
    `voted_count` AS "좋아요수",
    `is_notice` AS "공지여부",
    IF(`status` = 'SECRET', 'Y', '') AS "비밀글",
    "" AS "비밀번호"
FROM
    xe_documents
WHERE
    module_srl = 160

-- extra_vars
-- get handphone value
SELECT
	@var_match := REGEXP_SUBSTR(extra_vars, 's:9:\"handphone\";s:([0-9]+):\".+?\"') AS "match",
	@value := TRIM(BOTH '"' FROM SUBSTRING_INDEX(@var_match, ":", - 1)) AS "value"
FROM
	xe_member
WHERE
	extra_vars REGEXP('s:9:\"handphone\"');

-- extract img src
SELECT
	`document_srl`,
	@src := REPLACE(
		REPLACE(
			SUBSTR(
			   SUBSTR(`content`, LOCATE('src="', `content`) + 5), 1, 
			   LOCATE('"', SUBSTR(`content`, LOCATE('src="', `content`) + 5)) - 1
			), './files/attach', 'files/attach'
		), 'http://www.npcn.or.kr/', ''
	) as 'src'
FROM
    `xe_documents`
WHERE
    `module_srl` = 160
    AND `content` LIKE '%files/attach/images%';
