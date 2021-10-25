<?php
$myfile = fopen("file_name.txt", "w") or die("Unable to open file!");
$txt = "Hello world\n";
fwrite($myfile, $txt);
$txt = " Php.\n";
fwrite($myfile, $txt);
fclose($myfile);
?>