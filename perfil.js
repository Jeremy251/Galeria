import { auth } from './firebase.js';
import { updateProfile, deleteUser } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";

const changeNameBtn = document.getElementById('changeNameBtn');
const deleteAccountBtn = document.getElementById('deleteAccountBtn');
const newDisplayName = document.getElementById('newDisplayName');

// Cambiar nombre de usuario y recargar página
changeNameBtn.addEventListener('click', () => {
    const user = auth.currentUser;
    if (user && newDisplayName.value.trim() !== '') {
        updateProfile(user, { displayName: newDisplayName.value.trim() })
            .then(() => {
                // Recargar la página para reflejar el nuevo nombre
                location.reload();
            })
            .catch((error) => console.log(error));
    }
});

// Eliminar cuenta con confirm y redirigir al index
deleteAccountBtn.addEventListener('click', () => {
    const user = auth.currentUser;
    if (user) {
        if (confirm('¿Estás seguro de eliminar tu cuenta? Esta acción no se puede deshacer.')) {
            deleteUser(user)
                .then(() => {
                    // Redirigir al index
                    window.location.href = 'index.html';
                })
                .catch((error) => console.log(error));
        }
    }
});
