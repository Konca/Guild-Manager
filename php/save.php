<?php
$data = $_POST['jsonString'];
$name= $_POST['jsonName'];
//set mode of file to writable.
chmod("../raidHistory/$name",0777);
$f = fopen("../raidHistory/$name", "w+") or die("fopen failed");
fwrite($f, $data);
fclose($f);
?>