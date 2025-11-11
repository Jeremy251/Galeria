import { auth } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";

// --- Referencias DOM ---
const uploadArtBtn = document.getElementById("uploadArtBtn");
const addArtForm = document.getElementById("addArtForm");
const artImageInput = document.getElementById("artImage");
const imagePreview = document.getElementById("imagePreview");
const closeForm = document.getElementById("closeForm");
const saveArt = document.getElementById("saveArt");
const gallery = document.getElementById("gallery");
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const uploadedByField = document.getElementById("uploadedBy");

// --- Modal de comentarios ---
const commentModal = document.getElementById("commentModal");
const modalClose = document.getElementById("modalClose");
const modalArtImage = document.getElementById("modalArtImage");
const modalArtName = document.getElementById("modalArtName");
const modalArtist = document.getElementById("modalArtist");
const modalDescription = document.getElementById("modalDescription");
const commentsList = document.getElementById("commentsList");
const commentInput = document.getElementById("commentInput");
const ratingInput = document.getElementById("ratingInput");
const addCommentBtn = document.getElementById("addCommentBtn");

let currentUser = null;
let artworks = JSON.parse(localStorage.getItem("artworks")) || [];
let currentArtId = null;

// --- Usuario actual ---
onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user.displayName || user.email;
        uploadedByField.value = `Subido por: ${currentUser}`;
    } else {
        currentUser = null;
        uploadedByField.value = "No hay usuario activo";
    }
    renderGallery();
});

// --- Subir imagen (igual que antes) ---
uploadArtBtn.addEventListener("click", () => {
    if (!currentUser) {
        alert("Debes iniciar sesión para subir imágenes.");
        return;
    }
    artImageInput.click();
});

artImageInput.addEventListener("change", () => {
    const file = artImageInput.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = e => {
            imagePreview.src = e.target.result;
            imagePreview.classList.remove("hidden");
            addArtForm.classList.remove("hidden");
        };
        reader.readAsDataURL(file);
    }
});

closeForm.addEventListener("click", () => {
    addArtForm.classList.add("hidden");
    artImageInput.value = "";
    imagePreview.classList.add("hidden");
});

saveArt.addEventListener("click", () => {
    const artName = document.getElementById("artName").value.trim();
    const artistName = document.getElementById("artistName").value.trim();
    const price = document.getElementById("price").value.trim();
    const description = document.getElementById("description").value.trim();

    if (!artName || !artistName || !price || !description || !artImageInput.files[0]) {
        alert("Completa todos los campos.");
        return;
    }
    if (!currentUser) {
        alert("Debes iniciar sesión para guardar una imagen.");
        return;
    }

    const file = artImageInput.files[0];
    const reader = new FileReader();
    reader.onload = e => {
        const newArt = {
            id: Date.now().toString(),
            artName,
            artistName,
            price,
            description,
            image: e.target.result,
            uploadedBy: currentUser,
            comments: []
        };
        artworks.push(newArt);
        localStorage.setItem("artworks", JSON.stringify(artworks));

        renderGallery();
        addArtForm.classList.add("hidden");
        artImageInput.value = "";
        imagePreview.classList.add("hidden");
    };
    reader.readAsDataURL(file);
});

// --- Renderizar galería ---
let currentPage = 1;
const itemsPerPage = 15;

function renderGallery() {
    gallery.innerHTML = "";
    const startIndex = (currentPage - 1) * itemsPerPage;
    const pageItems = artworks.slice(startIndex, startIndex + itemsPerPage);

    pageItems.forEach(art => {
        const card = document.createElement("div");
        card.classList.add("arte-tarjeta");
        card.innerHTML = `
            <img src="${art.image}" alt="${art.artName}" data-id="${art.id}" class="clickable-art">
            <div class="art-info">
                <h3>${art.artName}</h3>
                <p><strong>Artista:</strong> ${art.artistName}</p>
                <p class="price">S/ ${art.price}</p>
                <p><em>${art.description}</em></p>
                <p><small>${art.uploadedBy}</small></p>
                ${currentUser && art.uploadedBy === currentUser ? `<button class="delete-btn" data-id="${art.id}">Eliminar</button>` : ""}
            </div>
        `;
        gallery.appendChild(card);
    });

    renderPagination();
}

// --- Paginación ---
function renderPagination() {
    const totalPages = Math.ceil(artworks.length / itemsPerPage);
    const pagination = document.createElement("div");
    pagination.classList.add("pagination");
    pagination.style.textAlign = "center";

    if (totalPages > 1) {
        if (currentPage > 1) {
            const prevBtn = document.createElement("button");
            prevBtn.textContent = "⟨ Anterior";
            prevBtn.addEventListener("click", () => { currentPage--; renderGallery(); });
            pagination.appendChild(prevBtn);
        }

        for (let i = 1; i <= totalPages; i++) {
            const btn = document.createElement("button");
            btn.textContent = i;
            if (i === currentPage) btn.classList.add("active");
            btn.addEventListener("click", () => { currentPage = i; renderGallery(); });
            pagination.appendChild(btn);
        }

        if (currentPage < totalPages) {
            const nextBtn = document.createElement("button");
            nextBtn.textContent = "Siguiente ⟩";
            nextBtn.addEventListener("click", () => { currentPage++; renderGallery(); });
            pagination.appendChild(nextBtn);
        }
    }

    gallery.appendChild(pagination);
}

// --- Eliminar imagen ---
gallery.addEventListener("click", e => {
    if (e.target.classList.contains("delete-btn")) {
        const id = e.target.dataset.id;
        const art = artworks.find(a => a.id === id);
        if (currentUser && art.uploadedBy === currentUser) {
            artworks = artworks.filter(a => a.id !== id);
            localStorage.setItem("artworks", JSON.stringify(artworks));
            renderGallery();
        } else {
            alert("Solo puedes eliminar imágenes que tú subiste.");
        }
    }

    // Abrir modal de comentarios al clickear imagen
    if (e.target.classList.contains("clickable-art")) {
        const id = e.target.dataset.id;
        openCommentModal(id);
    }
});

// --- Modal de comentarios ---
function openCommentModal(id) {
    currentArtId = id;
    const art = artworks.find(a => a.id === id);
    if (!art) return;

    modalArtImage.src = art.image;
    modalArtName.textContent = art.artName;
    modalArtist.textContent = "Artista: " + art.artistName;
    modalDescription.textContent = art.description;

    renderComments(art.comments);
    commentModal.classList.remove("hidden");
}

// --- Cerrar modal ---
modalClose.addEventListener("click", () => {
    commentModal.classList.add("hidden");
    commentInput.value = "";
    ratingInput.value = "";
});

// --- Agregar comentario ---
addCommentBtn.addEventListener("click", () => {
    const art = artworks.find(a => a.id === currentArtId);
    if (!art) return;
    const text = commentInput.value.trim();
    const rating = parseInt(ratingInput.value);

    if (!currentUser) {
        alert("Debes iniciar sesión para comentar.");
        return;
    }

    if (!text || !rating || rating < 1 || rating > 5) {
        alert("Escribe un comentario válido y asigna un rating de 1 a 5.");
        return;
    }

    art.comments.push({ user: currentUser, text, rating });
    localStorage.setItem("artworks", JSON.stringify(artworks));

    renderComments(art.comments);
    commentInput.value = "";
    ratingInput.value = "";
});

// --- Renderizar comentarios ---
function renderComments(comments) {
    commentsList.innerHTML = "";
    if (comments.length === 0) {
        commentsList.innerHTML = "<p>No hay comentarios aún.</p>";
        return;
    }
    comments.forEach(c => {
        const p = document.createElement("p");
        p.innerHTML = `<strong>${c.user}:</strong> ${c.text} - ⭐${c.rating}/5`;
        commentsList.appendChild(p);
    });
}

// --- Buscar ---
function searchImages() {
    const value = searchInput.value.toLowerCase();
    const filtered = artworks.filter(
        art => art.artName.toLowerCase().includes(value) || art.artistName.toLowerCase().includes(value)
    );
    renderFilteredGallery(filtered);
}

function renderFilteredGallery(list) {
    gallery.innerHTML = "";
    list.forEach(art => {
        const card = document.createElement("div");
        card.classList.add("arte-tarjeta");
        card.innerHTML = `
            <img src="${art.image}" alt="${art.artName}" data-id="${art.id}" class="clickable-art">
            <div class="art-info">
                <h3>${art.artName}</h3>
                <p><strong>Artista:</strong> ${art.artistName}</p>
                <p class="price">S/ ${art.price}</p>
                <p><em>${art.description}</em></p>
                <p><small>${art.uploadedBy}</small></p>
            </div>
        `;
        gallery.appendChild(card);
    });
}

searchBtn.addEventListener("click", searchImages);

// --- Inicializar ---
renderGallery();
