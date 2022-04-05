SELECT
    `post_id`,
    `meta_value`
FROM
    `wp_postmeta`
WHERE
    `post_id` IN (6584, 8363, 6597, 6773)
    AND `meta_key` = 'mfn-page-items'

-- http://sewoon.org/프로젝트-세운메이드 => 6584 sewoonmade
-- http://sewoon.org/프로젝트-도시기술장 => 8363 market
-- http://sewoon.org/프로젝트-주민공모사업 => 6597 open
-- http://sewoon.org/서비스-큐브입주-입주사소개 => 6773 makers