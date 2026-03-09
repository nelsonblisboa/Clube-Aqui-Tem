<?php
echo "PHP is working. Node version: ";
$output = shell_exec('node -v 2>&1');
echo $output ? $output : "Node not found.";
?>
