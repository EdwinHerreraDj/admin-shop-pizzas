@if (session('success'))
    <script>
        const notyf = new Notyf({
            duration: 4000,
            dismissible: true,
            position: { x: 'right', y: 'top' }
        });
        notyf.success(@json(session('success')));
    </script>
@endif
