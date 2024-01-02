$(document).ready(function () {
    alert('sfsdf');
    $('#form1').validate({ // initialize plugin
        
    });

    $('#btn').click( function() { 
        $("#form1").valid();  // test the form for validity
    });

});