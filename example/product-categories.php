<?php

error_reporting(E_ALL);

try {
    //$db = new PDO('pgsql:host=xxx dbname=xxx', 'xxx', 'xxx');
    $db = new mysqli('xxx', 'xxx', 'xxx', 'xxx', 3306);
    if ($db->connect_errno) {
        throw new Exception('Bad DB connect with error number: ' . $db->connect_errno);
    }
    $db->set_charset('utf8');

} catch (Exception $e) {
    die(json_encode(print_r($e, true), JSON_UNESCAPED_UNICODE));
}

$data = json_decode($HTTP_RAW_POST_DATA, true);
$id = isset($data['id']) ? $data['id'] : 0;

$parent = $id ? "p.parent_id = " . intval($id) : "p.parent_id IS NULL";
$sql =
<<<SQL
SELECT p.id, p.name, COUNT(c.id) AS children 
FROM product_categories p LEFT JOIN product_categories c ON p.id = c.parent_id AND c.deleted_at IS NULL
WHERE p.deleted_at IS NULL AND $parent
GROUP BY p.id
ORDER BY p.name
SQL;

function errorInfo($db) {
    $result = '';
    foreach ($db->error_list as $err) {
        $result .= ($result ? '; ' : '') .
            'errno: ' . $err['errno'] . ', ' .
            'sqlstate: ' . $err['sqlstate'] . ', ' .
            'error: ' . $err['error'];
    }
    return $result;
}

$result = $db->query($sql, MYSQLI_ASSOC);
if ($result === false) {
    die(json_encode([
        'success' => false,
        'error'   => errorInfo($db),
    ], JSON_UNESCAPED_UNICODE));
}

$result = $result->fetch_all(MYSQLI_ASSOC);

echo json_encode([
    'success' => true,
    'data'    => [
        'nodes' => $result
    ],
], JSON_UNESCAPED_UNICODE);