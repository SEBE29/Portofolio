const loginForm = document.querySelector("#login form");

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = document.querySelector("#email").value;
  const password = document.querySelector("#password").value;

  try {
    const response = await fetch("http://localhost:5678/api/users/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (response.ok) {
      const data = await response.json();
      localStorage.setItem("token", data.token);
      window.location.href = "index.html";
    } else {
      const error = await response.json();
      alert(error.message);
    }
  } catch (error) {
    console.error(error);
    alert("Une erreur est survenue, veuillez réessayer plus tard.");
  }
});
