import Swal from 'sweetalert2';

$(document).ready(function () {

    // Validar contraseñas antes de enviar el formulario
    validatePasswordOnSubmit('#editUserForm', '#edit_user_password', '#edit_user_password_confirmation', '#passError');

    // Configuración de SweetAlert para eliminar usuarios
    initializeDeleteAlert('.delete-user', '/users');

    // Ocultar mensaje de éxito después de un tiempo
    hideMessage();



    // Asignar funciones globales
    window.openModal = openModal;
    window.closeModal = closeModal;
    window.editUser = editUser;
});

// Validación de contraseñas en el formulario de edición
function validatePasswordOnSubmit(formSelector, passwordSelector, confirmPasswordSelector, errorSelector) {
    $(formSelector).on('submit', function (e) {
        const password = $(passwordSelector).val();
        const confirmPassword = $(confirmPasswordSelector).val();

        if (password && password !== confirmPassword) {
            e.preventDefault();
            $(errorSelector).removeClass('hidden');
            $(confirmPasswordSelector).addClass('border-red-500');
            $(passwordSelector).addClass('border-red-500');
            return false;
        }

        $(errorSelector).addClass('hidden');
        $(confirmPasswordSelector).removeClass('border-red-500');
        $(passwordSelector).removeClass('border-red-500');
    });
}

// Abrir un modal específico
function openModal(modalId) {
    const modal = $(`#${modalId}`);
    if (modal.length) {
        modal.removeClass('hidden').addClass('flex');
    } else {
        console.error(`Modal con ID "${modalId}" no encontrado.`);
    }
}

// Cerrar un modal específico
function closeModal(modalId) {
    const modal = $(`#${modalId}`);
    if (modal.length) {
        modal.removeClass('flex').addClass('hidden');
    } else {
        console.error(`Modal con ID "${modalId}" no encontrado.`);
    }
}

// Rellenar el modal de edición con los datos del usuario
function editUser(id, name, email, role) {
    $('#editUserForm').attr('action', `/users/${id}`);
    $('#edit_user_name').val(name);
    $('#edit_user_email').val(email);
    $('#edit_user_role').val(role);
    $('#edit_user_password').val('');
    $('#edit_user_password_confirmation').val('');
    $('#passError').addClass('hidden');
    openModal('editUserModal');
}

// Configuración de SweetAlert para eliminar usuarios
function initializeDeleteAlert(buttonSelector, deleteUrl) {
    $(document).on('click', '.delete-user', function () {
        const userId = $(this).data('user-id'); // Obtener el ID del usuario desde el botón
        Swal.fire({
            title: '¿Estás seguro?',
            text: 'Esta acción no se puede deshacer.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            customClass: {
                cancelButton: 'bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500',
                confirmButton: 'bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600',
            },
        }).then((result) => {
            if (result.isConfirmed) {
                // Enviar solicitud AJAX
                $.ajax({
                    url: `/users/${userId}`, // URL con el ID del usuario
                    type: 'DELETE',
                    headers: {
                        'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content') // Agregar token CSRF
                    },
                    success: function (response) {
                        if (response.success) {
                            Swal.fire('¡Eliminado!', response.message, 'success').then(() => {
                                location.reload();
                            });
                        } else {
                            Swal.fire('Error', response.message, 'error');
                        }
                    },
                    error: function (xhr, status, error) {
                        console.error('Error al eliminar el usuario:', xhr);
                        console.error('Estado:', status);
                        console.error('Mensaje de error:', error);
                        Swal.fire('Error', 'No se pudo eliminar el usuario. Inténtalo más tarde.', 'error');
                    }
                });
            } else {
                Swal.fire({
                    title: 'Cancelado',
                    text: 'El usuario está a salvo :)',
                    icon: 'info',
                    confirmButtonText: 'Entendido',
                    customClass: {
                        confirmButton: 'bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600',
                    },
                });
            }
        });
    });
}

//Ocualtar el mensaje de exito depues del exito
function hideMessage() {
    setTimeout(function () {
        $('#message-susses').addClass('hidden');
    }, 3000);
}



