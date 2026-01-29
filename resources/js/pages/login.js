document.addEventListener("DOMContentLoaded", function () {
    const pwd = document.getElementById("loggingPassword");
    const btn = document.getElementById("togglePassword");
    const icon = document.getElementById("togglePasswordIcon");

    if (!pwd || !btn || !icon) return;

    btn.addEventListener("click", function () {
        const isHidden = pwd.type === "password";
        pwd.type = isHidden ? "text" : "password";
        // Cambia el icono según el estado
        icon.classList.toggle("mgc_eye_line", !isHidden);
        icon.classList.toggle("mgc_eye_close_line", isHidden);
    });
});