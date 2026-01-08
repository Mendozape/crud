

<?php $__env->startSection('title', 'Admin Panel'); ?>

<?php $__env->startSection('content'); ?>
    
    <div id="react-container"></div>
<?php $__env->stopSection(); ?>

<?php $__env->startSection('js'); ?>
    
    <script>
        window.Laravel = <?php echo json_encode($data ?? [], 15, 512) ?>;
    </script>

    
    <?php echo app('Illuminate\Foundation\Vite')->reactRefresh(); ?>
    <?php echo app('Illuminate\Foundation\Vite')(['resources/js/app.js', 'resources/js/ReactApp.jsx']); ?>
<?php $__env->stopSection(); ?>

<?php echo $__env->make('adminlte::page', array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?><?php /**PATH C:\laragon\www\ComPay\resources\views/app.blade.php ENDPATH**/ ?>