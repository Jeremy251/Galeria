import { auth, db } from "./firebase.js";
import {
    createUserWithEmailAndPassword,
    updateProfile,
    GoogleAuthProvider,
    signInWithPopup,
    sendEmailVerification
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";
import { doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
    const registerForm = document.getElementById("registerForm");
    const googleRegisterBtn = document.getElementById("googleRegisterBtn");

    if (registerForm) {
        registerForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const nickname = document.getElementById("nickname").value.trim();
            const email = document.getElementById("email").value.trim();
            const password = document.getElementById("password").value;
            const confirmPassword = document.getElementById("confirmPassword").value;

            if (password !== confirmPassword) {
                alert("Las contraseñas no coinciden.");
                return;
            }

            try {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;

                await updateProfile(user, { displayName: nickname });

                await setDoc(doc(db, "usuarios", user.uid), {
                    nickname,
                    email,
                    creadoEn: new Date()
                });

                await sendEmailVerification(user);

                alert(`Cuenta creada exitosamente.\nSe envió un correo de verificación a: ${email}`);
            } catch (error) {
                console.error("Error al registrarte:", error);
                alert("Error al registrarte: " + error.message);
            }
        });
    }

    if (googleRegisterBtn) {
        googleRegisterBtn.addEventListener("click", async () => {
            const provider = new GoogleAuthProvider();

            try {
                const result = await signInWithPopup(auth, provider);
                const user = result.user;

                const userDoc = await getDoc(doc(db, "usuarios", user.uid));
                if (!userDoc.exists()) {
                    await setDoc(doc(db, "usuarios", user.uid), {
                        nickname: user.displayName || "Usuario Google",
                        email: user.email,
                        creadoEn: new Date()
                    });
                }

                window.location.href = "index.html";
            } catch (error) {
                if (error.code !== "auth/popup-closed-by-user") {
                    console.error("Error al registrarse con Google:", error);
                    alert("Error al registrarse con Google: " + error.message);
                }
            }
        });
    }
});
