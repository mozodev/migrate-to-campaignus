-- http://sewoon.org/sewoon-space/2809 -- post_type: sewoon_space
SELECT
    p.`ID`,
    SUBSTRING(p.`post_title`, 1, 100) AS "제목",
    (SELECT
        m.`meta_value`
    FROM
        `wp_postmeta` m
    WHERE
        p.`ID` = m.`post_id`
        AND m.`meta_key` = 'sewoon_space_description'
    ) AS "한줄설명",
    (SELECT
		GROUP_CONCAT(p2. `guid` separator '\n')
	FROM
		`wp_posts` p2
		LEFT OUTER JOIN `wp_postmeta` m ON m. `post_id` = p. `ID`
		AND m. `meta_key` = 'sewoon_main_image'
	WHERE
        p2. `ID` = m. `meta_value`
    ) AS "이미지",
    (SELECT
        GROUP_CONCAT(p2.`guid` separator '\n')
    FROM
        `wp_posts` p2
        LEFT OUTER JOIN `wp_postmeta` m ON
            m.`post_id` = p.`ID`
            AND m.`meta_key` LIKE 'sewoon_space_image_gallery_%_image'
    WHERE
        p2.`ID` = m. `meta_value`
        AND p2.`post_type` = 'attachment'
        AND p2.`post_mime_type` LIKE '%image%'
    ) AS "슬라이드",
    CONCAT_WS("\n",
        (SELECT
            IF(`meta_value` <> '', CONCAT(`meta_value`, ': '), '')
        FROM
            `wp_postmeta` m
        WHERE
            p.`ID` = m.`post_id`
            AND m.`meta_key` = 'sewoon_spce_additional_infos_0_title'
        ),
        (SELECT
            `meta_value`
        FROM
            `wp_postmeta` m
        WHERE
            p.`ID` = m.`post_id`
            AND m.`meta_key` = 'sewoon_spce_additional_infos_0_description'
        ),
        (SELECT
            IF(`meta_value` <> '', CONCAT(`meta_value`, ': '), '')
        FROM
            `wp_postmeta` m
        WHERE
            p.`ID` = m.`post_id`
            AND m.`meta_key` = 'sewoon_spce_additional_infos_1_title'
        ),
        (SELECT
            `meta_value`
        FROM
            `wp_postmeta` m
        WHERE
            p.`ID` = m.`post_id`
            AND m.`meta_key` = 'sewoon_spce_additional_infos_1_description'
        ),
        (SELECT
            IF(`meta_value` <> '', CONCAT(`meta_value`, ': '), '')
        FROM
            `wp_postmeta` m
        WHERE
            p.`ID` = m.`post_id`
            AND m.`meta_key` = 'sewoon_spce_additional_infos_2_title'
        ),
        (SELECT
            `meta_value`
        FROM
            `wp_postmeta` m
        WHERE
            p.`ID` = m.`post_id`
            AND m.`meta_key` = 'sewoon_spce_additional_infos_2_description'
        ),
        (SELECT
            IF(`meta_value` <> '', CONCAT(`meta_value`, ': '), '')
        FROM
            `wp_postmeta` m
        WHERE
            p.`ID` = m.`post_id`
            AND m.`meta_key` = 'sewoon_spce_additional_infos_3_title'
        ),
        (SELECT
            `meta_value`
        FROM
            `wp_postmeta` m
        WHERE
            p.`ID` = m.`post_id`
            AND m.`meta_key` = 'sewoon_spce_additional_infos_3_description'
        ),
        (SELECT
            IF(`meta_value` <> '', CONCAT(`meta_value`, ': '), '')
        FROM
            `wp_postmeta` m
        WHERE
            p.`ID` = m.`post_id`
            AND m.`meta_key` = 'sewoon_spce_additional_infos_4_title'
        ),
        (SELECT
            `meta_value`
        FROM
            `wp_postmeta` m
        WHERE
            p.`ID` = m.`post_id`
            AND m.`meta_key` = 'sewoon_spce_additional_infos_4_description'
        )
    ) AS "추가정보",
    (SELECT
        m.`meta_value`
    FROM
        `wp_postmeta` m
    WHERE
        p.`ID` = m.`post_id`
        AND m.`meta_key` = 'sewoon_space_rental'
    ) AS "예약기능",
    CONCAT_WS("\n",
        (SELECT
            IF(`meta_value` <> '0','예약가능', '예약불가')
        FROM
            `wp_postmeta` m
        WHERE
            p.`ID` = m.`post_id`
            AND m.`meta_key` = 'sewoon_space_rental'
        ),
        (SELECT
            CONCAT('예약유형 : ', `meta_value`)
        FROM
            `wp_postmeta` m
        WHERE
            p.`ID` = m.`post_id`
            AND m.`meta_key` = 'sewoon_space_rental_type'
        ),
        (SELECT
            CONCAT('예약링크 : ', `meta_value`)
        FROM
            `wp_postmeta` m
        WHERE
            p.`ID` = m.`post_id`
            AND m.`meta_key` = 'sewoon_space_rental_link'
        ),
        (SELECT
            CONCAT('예약버튼 : ', `meta_value`)
        FROM
            `wp_postmeta` m
        WHERE
            p.`ID` = m.`post_id`
            AND m.`meta_key` = 'sewoon_space_rental_label'
        ),
        (SELECT
            CONCAT('예약설명 : ', `meta_value`)
        FROM
            `wp_postmeta` m
        WHERE
            p.`ID` = m.`post_id`
            AND m.`meta_key` = 'sewoon_space_rental_description'
        )
    ) AS "예약정보",
    p.`post_content` AS "내용(HTML)",
    u.`display_name` AS "작성자",
    DATE_FORMAT(p.`post_date`, '%Y-%m-%d %H:%i:%s') AS "작성시간"
FROM
    `wp_posts` p
    LEFT OUTER JOIN `wp_postmeta` m ON
        p.`ID` = m.`post_id`
        AND m.`meta_key` = 'sewoon_space_additional_infos'
        AND m.`meta_value` IS NOT NULL
    LEFT OUTER JOIN `wp_users` u ON p.`post_author` = u.`ID`
WHERE
    p.`post_type` = 'sewoon_space'
    AND p.`post_status` = 'publish'
ORDER BY p.`ID` ASC;
