import { auth } from "./firebase.js";
import {
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut,
    GoogleAuthProvider,
    signInWithPopup
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";

document.addEventListener("DOMContentLoaded", () => {
    const userMenu = document.querySelector(".user-menu");
    const userIcon = userMenu.querySelector("i");
    const loginDropdown = userMenu.querySelector(".login-dropdown");
    const cartIcon = document.querySelector(".cart-icon");
    const cartDropdown = document.querySelector(".cart-dropdown");
    const loginForm = document.getElementById("loginForm");
    const googleLoginBtn = document.getElementById("googleLoginBtn");

    if (userIcon && loginDropdown) {
        userIcon.addEventListener("click", (e) => {
            e.stopPropagation();
            loginDropdown.style.display = loginDropdown.style.display === "block" ? "none" : "block";
            if (cartDropdown) cartDropdown.style.display = "none";
        });

        loginDropdown.addEventListener("click", (e) => e.stopPropagation());
    }

    if (cartIcon && cartDropdown) {
        cartIcon.addEventListener("click", (e) => {
            e.stopPropagation();
            cartDropdown.style.display = cartDropdown.style.display === "block" ? "none" : "block";
            if (loginDropdown) loginDropdown.style.display = "none";
        });

        cartDropdown.addEventListener("click", (e) => e.stopPropagation());
    }

    document.addEventListener("click", () => {
        if (loginDropdown) loginDropdown.style.display = "none";
        if (cartDropdown) cartDropdown.style.display = "none";
    });

    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const email = document.getElementById("loginEmail").value;
            const password = document.getElementById("loginPassword").value;

            try {
                const userCredential = await signInWithEmailAndPassword(auth, email, password);
                console.log("Sesión iniciada:", userCredential.user.email);
                window.location.href = "index.html";
            } catch (error) {
                alert("Error al iniciar sesión: " + error.message);
            }
        });
    }

    if (googleLoginBtn) {
        googleLoginBtn.addEventListener("click", async () => {
            const provider = new GoogleAuthProvider();
            try {
                const result = await signInWithPopup(auth, provider);
                const user = result.user;
                console.log("Sesión iniciada con Google:", user.displayName);
                window.location.href = "index.html";
            } catch (error) {
                console.error("Error al iniciar sesión con Google:", error);
                alert("Error con Google: " + error.message);
            }
        });
    }

    onAuthStateChanged(auth, (user) => {
        if (user) {
            userIcon.style.display = "none";
            loginDropdown.style.display = "none";

            let userNameBtn = document.createElement("button");
            userNameBtn.textContent = user.displayName || user.email;
            userNameBtn.classList.add("user-name-btn");
            userMenu.prepend(userNameBtn);

            const miniMenu = document.createElement("div");
            miniMenu.classList.add("login-dropdown");
            miniMenu.style.display = "none";
            miniMenu.innerHTML = `
                <p><a href="perfil.html">Configuración de perfil</a></p>
                <p><a href="#" id="logoutBtn">Cerrar sesión</a></p>
            `;
            userMenu.appendChild(miniMenu);

            userNameBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                miniMenu.style.display = miniMenu.style.display === "block" ? "none" : "block";
                if (cartDropdown) cartDropdown.style.display = "none";
            });

            miniMenu.addEventListener("click", (e) => e.stopPropagation());

            document.getElementById("logoutBtn").addEventListener("click", async (e) => {
                e.preventDefault();
                try {
                    await signOut(auth);
                    window.location.href = "index.html";
                } catch (error) {
                    console.error("Error al cerrar sesión:", error);
                }
            });
        }
    });
});
