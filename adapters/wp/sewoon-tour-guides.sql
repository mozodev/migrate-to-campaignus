-- http://sewoon.org/서비스-투어-해설사소개 => 6802 -- post_type: aoc_popup
SELECT
    p.`ID`,
    SUBSTRING(p.`post_title`, 1, 100) AS "제목",
    (SELECT
        GROUP_CONCAT(p2.`guid` separator '\n')
    FROM
        `wp_posts` p2
        LEFT OUTER JOIN `wp_postmeta` m ON
            m.`post_id` = p2.`ID`
            AND (m.`meta_key` = 'sewoon_main_image' OR m.`meta_key` = '_thumbnail_id')
    WHERE
        p2.`post_parent` = p.`ID`
        AND p2.`post_type` = 'attachment'
        AND p2.`post_mime_type` LIKE '%image%'
    ) AS "이미지",
    p.`post_content` AS "내용(HTML)",
    u.`display_name` AS "작성자",
    DATE_FORMAT(p.`post_date`, '%Y-%m-%d %H:%i:%s') AS "작성시간"
FROM
    `wp_posts` p
    LEFT OUTER JOIN `wp_postmeta` m ON
        p.`ID` = m.`post_id`
        AND m.`meta_key` = 'sewoon_makers_additional_infos'
        AND m.`meta_value` IS NOT NULL
    LEFT OUTER JOIN `wp_users` u ON p.`post_author` = u.`ID`
WHERE
    p.`post_type` = 'aoc_popup'
    AND p.`post_status` = 'publish'
ORDER BY p.`post_date` DESC;
