-- https://github.com/gnuboard/gnuboard4/blob/master/install/sql_gnuboard4.sql

SELECT<% if (locals.bid == 'board1_new3') { %>
    IF(b.`ca_name` IS NULL, '공고', b.`ca_name`) AS "카테고리ID",<% } else { %>
    '' AS "카테고리ID",<% } %>
    SUBSTRING(b.`wr_subject`, 1, 100) AS "제목",
    b.`wr_content` AS "내용(HTML)",
    b.`wr_name` AS "작성자",
    b.`wr_datetime` AS "작성시간",
    b.`wr_hit` AS "조회수",
    b.`wr_good` AS "좋아요수",
    "N" AS "공지여부",
    "" AS "비밀글",
    "" AS "비밀번호"
FROM
    `g4s_write_<%= bid %>` b
ORDER BY b.`wr_datetime` DESC

-- board1_new3
-- 입찰
-- 실습
-- 공고
-- 안내
