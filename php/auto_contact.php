<?php
/**
 * Created by IntelliJ IDEA.
 * User: wx_h0001
 * Date: 2016/5/7
 * Time: 14:59
 */

include "comm.php";
$mysqli = new mysqli("localhost", "root", "Ilovewow123", "db_customer");
$mysqli->query("set names 'utf8'");

if(!isset($_POST['customerId']))
{
    exit("Error");
}
$customerId = $_POST['customerId'];
$sql = "SELECT id, name FROM customer_contact WHERE CONCAT(customer_id_0, customer_id) = '{$customerId}'";
$rs_sql = $mysqli -> query($sql);
$data = array();

while($rs = mysqli_fetch_array($rs_sql))
{
    array_push($data, $rs);
}

echo json_encode($data);