-- all documents of specific board
-- mids: XE 게시판 아이디 배열
-- categories: 캠페이너스 게시글 카테고리
SELECT<% if (locals.categories) { %>
    CASE<% categories.forEach(row => { %>
        WHEN m.mid = '<%= Object.keys(row)[0] %>' THEN '<%= row[Object.keys(row)[0]] %>'<% }) %>
        ELSE ''
    END AS "카테고리ID",<% } else { %>
    '' AS "카테고리ID",<% } %>
    SUBSTRING(d.`title`, 1, 100) AS "제목", 
    d.`content` AS "내용(HTML)",
    d.`user_name` AS "작성자",
    STR_TO_DATE(d.`regdate`, '%Y%m%d%H%i%s') AS "작성시간",
    d.`readed_count` AS "조회수",
    d.`voted_count` AS "좋아요수",
    d.`is_notice` AS "공지여부",
    IF(d.`status` = 'SECRET', 'Y', '') AS "비밀글",
    "" AS "비밀번호"
FROM
    `xe_documents` d
    LEFT OUTER JOIN `xe_modules` m ON d.module_srl = m.module_srl
WHERE
    m.mid IN (<%- mids %>)
ORDER BY d.`regdate` DESC
