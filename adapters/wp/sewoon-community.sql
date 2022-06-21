-- http://sewoon.org/다시세운-커뮤니티-2 => 6656 -- post_type:sewoon_community (tids: 11,12)
SELECT
    p.`ID`,
    SUBSTRING(p.`post_title`, 1, 100) AS "제목",
    IF (tr.`term_taxonomy_id` = 11, '전략기관', '지역협의체') AS "구분",
    (SELECT
        m.`meta_value`
    FROM
        `wp_postmeta` m
    WHERE
        p.`ID` = m.`post_id`
        AND m.`meta_key` = 'sewoon_community_sub_title'
    ) AS "한줄설명",
    p.`post_excerpt` AS "요약",
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
    CONCAT_WS("\n",
        (SELECT
            IF(`meta_value` <> '', CONCAT(`meta_value`, ': '), '')
        FROM
            `wp_postmeta` m
        WHERE
            p.`ID` = m.`post_id`
            AND m.`meta_key` = 'sewoon_community_additional_infos_0_title'
        ),
        (SELECT
            `meta_value`
        FROM
            `wp_postmeta` m
        WHERE
            p.`ID` = m.`post_id`
            AND m.`meta_key` = 'sewoon_community_additional_infos_0_description'
        ),
        (SELECT
            IF(`meta_value` <> '', CONCAT(`meta_value`, ': '), '')
        FROM
            `wp_postmeta` m
        WHERE
            p.`ID` = m.`post_id`
            AND m.`meta_key` = 'sewoon_community_additional_infos_1_title'
        ),
        (SELECT
            `meta_value`
        FROM
            `wp_postmeta` m
        WHERE
            p.`ID` = m.`post_id`
            AND m.`meta_key` = 'sewoon_community_additional_infos_1_description'
        ),
        (SELECT
            IF(`meta_value` <> '', CONCAT(`meta_value`, ': '), '')
        FROM
            `wp_postmeta` m
        WHERE
            p.`ID` = m.`post_id`
            AND m.`meta_key` = 'sewoon_community_additional_infos_2_title'
        ),
        (SELECT
            `meta_value`
        FROM
            `wp_postmeta` m
        WHERE
            p.`ID` = m.`post_id`
            AND m.`meta_key` = 'sewoon_community_additional_infos_2_description'
        ),
        (SELECT
            IF(`meta_value` <> '', CONCAT(`meta_value`, ': '), '')
        FROM
            `wp_postmeta` m
        WHERE
            p.`ID` = m.`post_id`
            AND m.`meta_key` = 'sewoon_community_additional_infos_3_title'
        ),
        (SELECT
            `meta_value`
        FROM
            `wp_postmeta` m
        WHERE
            p.`ID` = m.`post_id`
            AND m.`meta_key` = 'sewoon_community_additional_infos_3_description'
        ),
        (SELECT
            IF(`meta_value` <> '', CONCAT(`meta_value`, ': '), '')
        FROM
            `wp_postmeta` m
        WHERE
            p.`ID` = m.`post_id`
            AND m.`meta_key` = 'sewoon_community_additional_infos_4_title'
        ),
        (SELECT
            `meta_value`
        FROM
            `wp_postmeta` m
        WHERE
            p.`ID` = m.`post_id`
            AND m.`meta_key` = 'sewoon_community_additional_infos_4_description'
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
    LEFT OUTER JOIN `wp_term_relationships` tr ON tr.`object_id` = p.`ID`
WHERE
    p.`post_type` = 'sewoon_community'
    AND p.`post_status` = 'publish'
ORDER BY p.`post_date` DESC;
