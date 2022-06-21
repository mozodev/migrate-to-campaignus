SELECT
    p.`ID`,
    p.`post_title`,
    p.`post_content`,
    p.`post_status`,
    p.`post_type`,
    m.`gos_simple_redirect`
FROM
    `wp_term_relationships` tr
    LEFT OUTER JOIN `wp_posts` p ON p.`ID` = tr.`object_id`
    LEFT OUTER JOIN `wp_postmeta` m ON m.`post_id` = p.`ID`
WHERE
    tr.`term_taxonomy_id` IN (52,55)
ORDER BY p.`post_date` DESC;
-- fields!
-- wp_posts.post_content = '' ==> wp_postmeta.gos_simple_redirect
