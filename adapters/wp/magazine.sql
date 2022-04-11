SELECT
    p.`ID`,
    p.`post_title`,
    p.`post_content`,
    p.`post_status`,
    p.`post_type`
FROM
    `wp_term_relationships` tr
    LEFT OUTER JOIN `wp_posts` p ON p.`ID` = tr.`object_id`
WHERE
    tr.`term_taxonomy_id` IN (52,55)
ORDER BY p.`post_date` DESC;
-- fields!
-- wp_posts.post_content = '' ==> wp_postmeta.gos_simple_redirect
