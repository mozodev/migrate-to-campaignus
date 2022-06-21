SELECT<% if (locals.categories) { %>
    CASE<% categories.forEach(row => { %>
        WHEN m.mid = '<%= Object.keys(row)[0] %>' THEN '<%= row[Object.keys(row)[0]] %>'<% }) %>
        ELSE ''
    END AS "카테고리ID",<% } else { %>
    '' AS "카테고리ID",<% } %>
    SUBSTRING(p.`post_title`, 1, 100) AS "제목",
    p.`post_content` AS "내용(HTML)",
    IF(u.`display_name` = '', '<%= defaultUserName %>', u.`display_name`) AS "작성자",
    DATE_FORMAT(p.`post_date`, '%Y-%m-%d %H:%i:%s') AS "작성시간",
    (
        SELECT
            `meta_value`
        FROM
            `wp_postmeta` m
        WHERE
            p.`ID` = m.`post_id`
            AND m.`meta_key` = 'rainboard_view_count'
    ) AS "조회수",
    '' AS "좋아요수",
    'N' AS "공지여부",
    'N' AS "비밀글",
    '' AS "비밀번호"
FROM
    `wp_posts` p
    LEFT OUTER JOIN `wp_postmeta` m ON p.`ID` = m.`post_id`
    LEFT OUTER JOIN `wp_users` u ON p.`post_author` = u.`ID`
WHERE
    p.`post_type` = 'rainboard_post'
    AND p.`post_status` = 'publish'
    AND m.`meta_key` = 'rainboard_origin'
    <% if (locals.mids) { %>AND m.`meta_value` IN (<%= mids %>)<% } %>
ORDER BY p.`post_date` DESC
