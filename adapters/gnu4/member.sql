-- member.sql 회원
-- https://github.com/gnuboard/gnuboard4/blob/master/install/sql_gnuboard4.sql#L399

SELECT
    m.`mb_email` AS "E-mail",
    m.`mb_id` AS "ID",
    '1234567890' AS "비밀번호",
    (SELECT
        GROUP_CONCAT(g.`gr_subject` separator ',')
    FROM
        `g4s_group_member` gm
        LEFT OUTER JOIN `g4s_group` g ON gm.`gr_id` = g.`gr_id`
    WHERE
        m.`mb_id` = gm.`mb_id`
    ) AS "회원그룹",
    '' AS "쇼핑등급",
    '' AS "가입유형 ID",
    m.`mb_name` AS "이름",
    m.`mb_sex` AS "성별",
    m.`mb_hp` AS "연락처",
    m.`mb_homepage` AS "홈페이지",
    m.`mb_zip1` AS "우편번호",
    m.`mb_addr1` AS "주소",
    m.`mb_addr2` AS "상세주소",
    STR_TO_DATE(m.`mb_birth`, '%Y%m%d') AS "생년월일",
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
    `g4s_member` m;
