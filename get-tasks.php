<?php

$tasks = array(
	array(
		'name' => 'name1',
		'category' => 'cat1',
	),
	array(
		'name' => 'name2',
		'category' => 'cat2',
	),
	array(
		'name' => 'name3',
		'category' => 'cat3',
	),
	array(
		'name' => 'name4',
		'category' => 'cat4',
	),
);

header('Content-Type: application/json');

if ($_GET['p'] == 'count') {
	print json_encode(4);
}
else {
	
	if (!empty($_GET['limit'])) {
		$limit = (int)$_GET['limit'];
	}
	if (isset($_GET['offset'])) {
		$offset = (int)$_GET['offset'];
		if (!empty($limit)) {
			$out = array_slice($tasks, $offset, $limit);
		}
		else {
			$out = array_slice($tasks, $offset);
		}
	}
print json_encode($out);
}
?>
