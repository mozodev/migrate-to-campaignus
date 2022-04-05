SELECT
    *
FROM
    `wp_posts`
WHERE
    `post_type` = 'sewoon_makers'

-- posts images
-- 2021: 8450,8451,8452,8453,8449,8455,8454,8457,8448
-- 2019: 6977,6978,6979,6980,6981,6982,6983,6984,6985,6986
-- 2018: 6987,6988,6989,6990
SELECT
    "2020~21" AS `year`,
    `post_parent`,
    `post_title`,
    `guid`
FROM
    `wp_posts`
WHERE
    `ID` IN (8450,8451,8452,8453,8449,8455,8454,8457,8448)
UNION
SELECT
    "2019" AS `year`,
    `post_parent`,
    `post_title`,
    `guid`
FROM
    `wp_posts`
WHERE
    `ID` IN (6977,6978,6979,6980,6981,6982,6983,6984,6985,6986)
UNION
SELECT
    "2018" AS `year`,
    `post_parent`,
    `post_title`,
    `guid`
FROM
    `wp_posts`
WHERE
    `ID` IN (6987,6988,6989,6990)