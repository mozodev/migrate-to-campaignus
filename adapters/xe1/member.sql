-- members.sql 회원
SELECT
    m.`email_address` AS "E-mail",
    m.`user_id` AS "ID",
    '1234567890' AS "비밀번호",
    (SELECT
        GROUP_CONCAT(mg.title separator ',')
    FROM
        xe_member_group_member mgm
        LEFT OUTER JOIN xe_member_group mg ON mgm.group_srl = mg.group_srl
    WHERE
        m.member_srl = mgm.member_srl
    GROUP BY mg.group_srl
    ) AS "회원그룹",
    '' AS "쇼핑등급",
    '' AS "가입유형 ID",
    m.`user_name` AS "이름",
    '' AS "성별",
    TRIM(BOTH '"' FROM SUBSTRING_INDEX(REGEXP_SUBSTR(m.extra_vars, 's:9:\"handphone\";s:([0-9]+):\".+?\"'), ":", -1)) AS "연락처",
    m.`homepage` AS "홈페이지",
    '' AS "우편번호",
    '' AS "주소",
    REPLACE(TRIM(BOTH '"' FROM SUBSTRING_INDEX(REGEXP_SUBSTR(m.extra_vars, 's:12:\"home_address\";s:([0-9]+):\".+?\";'), ":", -1)), '";', '') AS "상세주소",
    STR_TO_DATE(m.`birthday`, '%Y%m%d') AS "생년월일",
    '' AS "상호",
    '' AS "사업자번호",
    '' AS "대표자명",
    '' AS "사업자 연락처",
    '' AS "종목",
    '' AS "사업장 우편번호",
    '' AS "사업장 주소",
    '' AS "사업장 상세주소",
    '' AS "담당자명",
    '' AS "적립금",
    '' AS "Google ID",
    '' AS "Facebook ID",
    '' AS "Kakao ID",
    '' AS "Naver ID"
FROM
    xe_member m
