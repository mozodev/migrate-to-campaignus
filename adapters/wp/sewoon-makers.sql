-- http://sewoon.org/서비스-큐브입주-입주사소개 => 6773
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
    (SELECT
        m.`meta_value`
    FROM
        `wp_postmeta` m
    WHERE
        p.`ID` = m.`post_id`
        AND m.`meta_key` = 'sewoon_makers_location'
    ) AS "위치",
    CONCAT_WS("\n",
        (SELECT
            IF(`meta_value` <> '', CONCAT(`meta_value`, ': '), '')
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
            IF(`meta_value` <> '', CONCAT(`meta_value`, ': '), '')
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
            IF(`meta_value` <> '', CONCAT(`meta_value`, ': '), '')
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
            IF(`meta_value` <> '', CONCAT(`meta_value`, ': '), '')
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
        )
    ) AS "추가정보",
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
    p.`post_type` = 'sewoon_makers'
    AND p.`post_status` = 'publish'
ORDER BY p.`post_date` DESC;
