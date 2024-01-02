<?php
function solution($arraya) {
  $arrayc = array_filter(array_count_values(str_split(implode("",$arraya))), 
    function($val){ 
      return $val > 1;
   });
   ksort($arrayc);
   foreach($arrayc as $x=>$value){
    echo $x."<br>";
   }
}
$arraya = array('25','2','3','57','38','41');
$r=solution($arraya); 

?>
