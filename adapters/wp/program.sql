SELECT
    '' AS "카테고리ID",
    SUBSTRING(p.`post_title`, 1, 100) AS "제목",
    CONCAT_WS("\n",
        (SELECT
            IF(`meta_value` <> '', CONCAT('한줄설명: ', `meta_value`), '')
        FROM
            `wp_postmeta` m
        WHERE
            p.`ID` = m.`post_id`
            AND m.`meta_key` = 'sewoon_program_description'
        ),
        (SELECT
            IF(`meta_value` <> '', CONCAT('<br />날짜: ', REPLACE(STR_TO_DATE(`meta_value`, '%Y%m%d'), '-', '.')), '')
        FROM
            `wp_postmeta` m
        WHERE
            p.`ID` = m.`post_id`
            AND m.`meta_key` = 'sewoon_program_startdate'
        ),
        (SELECT
            IF(`meta_value` <> '', CONCAT(' ~ ', REPLACE(STR_TO_DATE(`meta_value`, '%Y%m%d'), '-', '.')), '')
        FROM
            `wp_postmeta` m
        WHERE
            p.`ID` = m.`post_id`
            AND m.`meta_key` = 'sewoon_program_enddate'
        ),
        (SELECT
            IF(`meta_value` <> '', CONCAT('<br />시간: ', `meta_value`), '')
        FROM
            `wp_postmeta` m
        WHERE
            p.`ID` = m.`post_id`
            AND m.`meta_key` = 'sewoon_program_time'
        ),
        (SELECT
            IF(`meta_value` <> '', CONCAT('<br />', `meta_value`, ': '), '')
        FROM
            `wp_postmeta` m
        WHERE
            p.`ID` = m.`post_id`
            AND m.`meta_key` = 'sewoon_program_additional_infos_0_title'
        ),
        (SELECT
            `meta_value`
        FROM
            `wp_postmeta` m
        WHERE
            p.`ID` = m.`post_id`
            AND m.`meta_key` = 'sewoon_program_additional_infos_0_description'
        ),
        (SELECT
            IF(`meta_value` <> '', CONCAT('<br />', `meta_value`, ': '), '')
        FROM
            `wp_postmeta` m
        WHERE
            p.`ID` = m.`post_id`
            AND m.`meta_key` = 'sewoon_program_additional_infos_1_title'
        ),
        (SELECT
            `meta_value`
        FROM
            `wp_postmeta` m
        WHERE
            p.`ID` = m.`post_id`
            AND m.`meta_key` = 'sewoon_program_additional_infos_1_description'
        ),
        (SELECT
            IF(`meta_value` <> '', CONCAT('<br />', `meta_value`, ': '), '')
        FROM
            `wp_postmeta` m
        WHERE
            p.`ID` = m.`post_id`
            AND m.`meta_key` = 'sewoon_program_additional_infos_2_title'
        ),
        (SELECT
            `meta_value`
        FROM
            `wp_postmeta` m
        WHERE
            p.`ID` = m.`post_id`
            AND m.`meta_key` = 'sewoon_program_additional_infos_2_description'
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
        AND m.`meta_key` = 'sewoon_program_startdate'
        AND m.`meta_value` IS NOT NULL
    LEFT OUTER JOIN `wp_users` u ON p.`post_author` = u.`ID`
WHERE
    p.`post_type` = 'sewoon_program'
    AND p.`post_status` = 'publish'
ORDER BY p.`post_date` DESC
