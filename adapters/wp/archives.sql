SELECT
    p.`ID`,
    p.`post_title`,
    p.`post_content`,
    m.`meta_value`
FROM
    `wp_term_relationships` tr
    LEFT OUTER JOIN `wp_posts` p ON p.`ID` = tr.`object_id`
    LEFT OUTER JOIN `wp_postmeta` m ON m.`post_id` = p.`ID` AND m.`meta_key` = '3dfb_data'
WHERE
    tr.`term_taxonomy_id` IN (58)
    AND p.`post_status` = 'publish'
ORDER BY p.`post_date` DESC;
