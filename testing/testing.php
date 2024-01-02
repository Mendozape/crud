<?php
     $edad=44;
    function prueba(){
        global $edad;
        $name="Erasto";
        $lastName="Mendoza";
        //echo $edad;
        //echo $_SERVER['SERVER_PORT'];
        echo $edad, ' ',$name; 
        print $edad, ' ',$name;
    }
    prueba();
?>