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
	array(
		'name' => 'name5',
		'category' => 'cat5',
	),
	array(
		'name' => 'name6',
		'category' => 'cat6',
	),
	array(
		'name' => 'name7',
		'category' => 'cat7',
	),
);

header('Content-Type: application/json');

if ($_GET['p'] == 'count') {
	print json_encode(count($tasks));
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
