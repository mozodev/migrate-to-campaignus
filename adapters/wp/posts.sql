SELECT
    '' AS "카테고리ID",
    SUBSTRING(p.`post_title`, 1, 100) AS "제목",
    p.`post_content` AS "내용(HTML)",
    u.`display_name` AS "작성자",
    DATE_FORMAT(p.`post_date`, '%Y-%m-%d %H:%i:%s') AS "작성시간",
    '' AS "조회수",
    '' AS "좋아요수",
    'N' AS "공지여부",
    'N' AS "비밀글",
    '' AS "비밀번호"
FROM
    `wp_posts` p
    LEFT OUTER JOIN `wp_users` u ON p.`post_author` = u.`ID`
WHERE
    p.`post_status` = 'publish'
    <% if (locals.postTypes) { %>AND p.`post_type` IN ('<%= postTypes %>')<% } %>
ORDER BY p.`post_date` DESC
