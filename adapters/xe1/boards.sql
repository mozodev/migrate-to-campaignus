-- boards list
SELECT
    module_srl,
    mid,
    browser_title
FROM
    xe_modules
WHERE
    module = "board"