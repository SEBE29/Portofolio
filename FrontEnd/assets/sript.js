const loginbtn = document.getElementById("connexion");
const modal = document.getElementById("modal");
const btn = document.getElementById("open-modal-btn");
const span = document.getElementsByClassName("close")[0];
const images = document.getElementById("images");
const formImage = document.getElementById("formImage");
const retour = document.getElementById("retour");
const btnajout = document.getElementById("btnajout");
const categoryMenu = document.getElementById("category-menu");
const form = document.getElementById("form");
const fileInput = document.getElementById("image");
const previewImage = document.querySelector(".preview-image");
const label = document.querySelector(".upload-text");

let category_affiche = 0;
let works, les_categories;

initialisation();

async function initialisation() {
  const token = localStorage.getItem("token");
  console.log("token", token);

  createConnexionButton();
  await getWorks();
  await getCategory();
  createCard();
  if (token) {
    categoryMenu.style.display = "none";
    btn.style.display = "block";
  } else {
    categoryMenu.style.display = "flex";
    btn.style.display = "none";
  }
}

loginbtn.onclick = function () {
  const token = localStorage.getItem("token");
  if (token) {
    localStorage.removeItem("token");
  } else {
    window.location.href = "login.html";
  }
};

btn.onclick = function () {
  modal.showModal();
};

span.onclick = function () {
  modal.close();
};

fileInput.addEventListener("change", function () {
  const file = this.files[0];
  if (file) {
    label.style.display = "none";
    previewImage.style.height = "150px";
    const reader = new FileReader();
    reader.onload = function (e) {
      previewImage.src = e.target.result; // Affiche l'image sélectionnée
    };
    reader.readAsDataURL(file);
  }
});

btnajout.onclick = function () {
  const hr = document.getElementById("hr");
  const h2 = document.querySelector("#modal h2");
  h2.textContent = "Ajout Photo";
  const form = document.getElementById("form");
  retour.style.display = "block";
  form.style.display = "flex";
  btnajout.style.display = "none";
  images.style.display = "none";
  hr.style.display = "none";

  const select = document.querySelector("#form select");
  select.innerHTML = ""; // Réinitialise les options avant de les remplir à nouveau

  les_categories.forEach((category) => {
    const option = document.createElement("option");
    option.textContent = category.name;
    option.value = category.id;
    select.appendChild(option);
  });
};

retour.onclick = function () {
  const hr = document.getElementById("hr");
  const h2 = document.querySelector("#modal h2");
  h2.textContent = "Galerie Photo";
  const form = document.getElementById("form");
  retour.style.display = "none";
  form.style.display = "none";
  btnajout.style.display = "flex";
  images.style.display = "flex";
  hr.style.display = "block";
};

function createConnexionButton() {
  const token = localStorage.getItem("token");
  if (token) {
    loginbtn.textContent = "Logout";
  } else {
    loginbtn.textContent = "Login";
  }
  console.log(token);
}

// Récupérez les catégories depuis l'API
async function getCategory() {
  await fetch("http://localhost:5678/api/categories")
    .then((response) => response.json())
    .then((data) => {
      les_categories = data;
      const categories = new Set();
      data.forEach((category) => {
        categories.add(category);
      });

      const all = document.createElement("li");
      all.textContent = "Tout";
      if (category_affiche == 0) {
        all.style.backgroundColor = "#1d6154";
        all.style.color = "white";
      }
      all.addEventListener("click", () => {
        category_affiche == 0;
        filterProjects(0);
      });
      categoryMenu.appendChild(all);

      categories.forEach((category, index) => {
        const li = document.createElement("li");
        li.textContent = category.name;
        li.addEventListener("click", () => {
          category_affiche = index;
          if (category_affiche == index) {
            li.style.backgroundColor = "#1d6154";
            li.style.color = "white";
          }
          filterProjects(category.id);
        });
        categoryMenu.appendChild(li);
      });
    })
    .catch((error) => console.error("Error:", error));
}

function createCard(data) {
  let cardData;
  const gallery = document.querySelector(".gallery");
  gallery.innerHTML = "";

  if (data) {
    cardData = data;
  } else {
    cardData = works;
  }

  cardData.map((project) => {
    const figure = document.createElement("figure");
    const img = document.createElement("img");
    const figcaption = document.createElement("figcaption");

    img.src = project.imageUrl;
    img.alt = project.title;
    figcaption.textContent = project.title;
    figure.dataset.category = project.categoryId;
    // figure.dataset.data_id = project.category.id;
    figure.appendChild(img);
    figure.appendChild(figcaption);
    gallery.appendChild(figure);
  });

  createModalCard(cardData);
}

function createModalCard(data) {
  images.innerHTML = "";
  data.map((project) => {
    const imgdiv = document.createElement("div");
    const img = document.createElement("img");
    const deleteButton = document.createElement("div");
    const icon = document.createElement("i");
    img.src = project.imageUrl;
    img.alt = project.title;
    icon.classList.add("fa-solid", "fa-trash-can");
    deleteButton.appendChild(icon);
    deleteButton.addEventListener("click", () => deleteProject(project.id));
    imgdiv.appendChild(img);
    imgdiv.appendChild(deleteButton);
    images.appendChild(imgdiv);
  });
}

async function getWorks() {
  await fetch("http://localhost:5678/api/works")
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      works = data;
    })
    .catch((error) => console.error("Error:", error));
}

function filterProjects(category) {
  const filtre = works.filter((work) => work.categoryId === category);
  if (category == 0) {
    createCard();
  } else {
    createCard(filtre);
  }
}

function deleteProject(id) {
  const token = localStorage.getItem("token");
  fetch(`http://localhost:5678/api/works/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then(async (response) => {
      if (response.ok) {
        alert("Projet supprimé avec succès");
        await getWorks();
        createCard();
      } else {
        alert("Erreur lors de la suppression du projet");
      }
    })
    .catch((error) => console.error(error));
}

// Gestion de l'envoi d'un nouveau projet via le formulaire
form.addEventListener("submit", function (event) {
  event.preventDefault();

  const formData = new FormData(form);
  const token = localStorage.getItem("token");

  // Vérification que tous les champs sont remplis
  if (
    !formData.get("title") ||
    formData.get("image").name == "" ||
    !formData.get("category")
  ) {
    alert("Veuillez remplir tous les champs.");
    return;
  }

  fetch("http://localhost:5678/api/works", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  })
    .then((response) => response.json())
    .then(async (data) => {
      console.log(data);
      await getWorks();
      createCard();
      form.reset();
      modal.close();
    })
    .catch((error) => {
      console.error("Erreur lors de l'envoi du formulaire :", error);
      alert("Erreur lors de l'envoi du formulaire.");
    });
});
