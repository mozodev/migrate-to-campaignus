-- http://sewoon.org/서비스-큐브입주-입주사소개 => 6773
SELECT
    '' AS "카테고리ID",
    SUBSTRING(p.`post_title`, 1, 100) AS "제목",
    CONCAT_WS("\n",
        (SELECT
            GROUP_CONCAT(CONCAT('<img src="', p2.`guid`, '" alt="', p2.`post_title`, '" />') separator '\n')
        FROM
            `wp_posts` p2
            LEFT OUTER JOIN `wp_postmeta` m ON
                m.`post_id` = p2.`ID`
                AND (m.`meta_key` = 'sewoon_main_image' OR m.`meta_key` = '_thumbnail_id')
        WHERE
            p2.`post_parent` = p.`ID`
            AND p2.`post_type` = 'attachment'
            AND p2.`post_mime_type` LIKE '%image%'
        ),
        (SELECT
            CONCAT('<img src="', p.`guid`, '" alt="', p.`post_title`, '" />')
        FROM
            `wp_postmeta` m
            LEFT OUTER JOIN `wp_posts` p ON p.`ID` = m.`meta_value`
        WHERE
            p.`ID` = m.`post_id`
            AND m.`meta_key` = 'sewoon_main_image'
        ),
        (SELECT
            IF(`meta_value` <> '', CONCAT('위치: ', `meta_value`), '')
        FROM
            `wp_postmeta` m
        WHERE
            p.`ID` = m.`post_id`
            AND m.`meta_key` = 'sewoon_makers_location'
        ),
        (SELECT
            IF(`meta_value` <> '', CONCAT('<br />', `meta_value`, ': '), '')
        FROM
            `wp_postmeta` m
        WHERE
            p.`ID` = m.`post_id`
            AND m.`meta_key` = 'sewoon_makers_additional_infos_0_title'
        ),
        (SELECT
            `meta_value`
        FROM
            `wp_postmeta` m
        WHERE
            p.`ID` = m.`post_id`
            AND m.`meta_key` = 'sewoon_makers_additional_infos_0_description'
        ),
        (SELECT
            IF(`meta_value` <> '', CONCAT('<br />', `meta_value`, ': '), '')
        FROM
            `wp_postmeta` m
        WHERE
            p.`ID` = m.`post_id`
            AND m.`meta_key` = 'sewoon_makers_additional_infos_1_title'
        ),
        (SELECT
            `meta_value`
        FROM
            `wp_postmeta` m
        WHERE
            p.`ID` = m.`post_id`
            AND m.`meta_key` = 'sewoon_makers_additional_infos_1_description'
        ),
        (SELECT
            IF(`meta_value` <> '', CONCAT('<br />', `meta_value`, ': '), '')
        FROM
            `wp_postmeta` m
        WHERE
            p.`ID` = m.`post_id`
            AND m.`meta_key` = 'sewoon_makers_additional_infos_2_title'
        ),
        (SELECT
            `meta_value`
        FROM
            `wp_postmeta` m
        WHERE
            p.`ID` = m.`post_id`
            AND m.`meta_key` = 'sewoon_makers_additional_infos_2_description'
        ),
        (SELECT
            IF(`meta_value` <> '', CONCAT('<br />', `meta_value`, ': '), '')
        FROM
            `wp_postmeta` m
        WHERE
            p.`ID` = m.`post_id`
            AND m.`meta_key` = 'sewoon_makers_additional_infos_3_title'
        ),
        (SELECT
            `meta_value`
        FROM
            `wp_postmeta` m
        WHERE
            p.`ID` = m.`post_id`
            AND m.`meta_key` = 'sewoon_makers_additional_infos_3_description'
        ),
        '\n\n\n\n\n',
        p.`post_content`
    ) AS "내용(HTML)",
    u.`display_name` AS "작성자",
    DATE_FORMAT(p.`post_date`, '%Y-%m-%d %H:%i:%s') AS "작성시간",
    '' AS "조회수",
    '' AS "좋아요수",
    'N' AS "공지여부",
    'N' AS "비밀글",
    '' AS "비밀번호"
FROM
    `wp_posts` p
    LEFT OUTER JOIN `wp_postmeta` m ON
        p.`ID` = m.`post_id`
        AND m.`meta_key` = 'sewoon_makers_additional_infos'
        AND m.`meta_value` IS NOT NULL
    LEFT OUTER JOIN `wp_users` u ON p.`post_author` = u.`ID`
WHERE
    p.`post_type` = 'sewoon_makers'
    AND p.`post_status` = 'publish'
ORDER BY p.`post_date` DESC;
