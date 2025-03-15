const API_BASE_URL = "http://127.0.0.1:8000";

document.addEventListener("DOMContentLoaded", function() {
    checkLoginStatus();
    setupLoginForm();
    setupToolbar();
});

function setupToolbar() {
    document.getElementById("btn-list").addEventListener("click", function() {
        setActiveTab("list-page", this);
    });
    document.getElementById("btn-generator").addEventListener("click", function() {
        setActiveTab("generator-page", this);
    });
    document.getElementById("btn-settings").addEventListener("click", function() {
        setActiveTab("settings-page", this);
    });
}

function setActiveTab(pageId, activeButton) {
    const pages = document.querySelectorAll(".page");
    pages.forEach(page => page.style.display = "none");

    document.getElementById(pageId).style.display = "block";

    document.querySelectorAll("#toolbar button").forEach(button => {
        const img = button.querySelector("img");
        if (button === activeButton) {
            button.classList.add("active");
            img.src = button.dataset.activeIcon;
        } else {
            button.classList.remove("active");
            img.src = button.dataset.inactiveIcon;
        }
    });
}

function showPage(pageId) {
    const pages = document.querySelectorAll(".page");
    pages.forEach(page => page.style.display = "none");
    document.getElementById(pageId).style.display = "block";
}

function showError(message) {
    const errorElement = document.getElementById("login-status");
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.color = "red";
    }
}

// Login elements

function onLoginSuccess() {
    document.getElementById("login-container").style.display = "none";
    document.getElementById("app-page").style.display = "block";
    setActiveTab("list-page", document.getElementById("btn-list"));
}

async function loginUser(email, password, rememberMe) {
    const formData = new URLSearchParams();
    formData.append("username", email);
    formData.append("password", password);

    try {
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: formData
        });

        const data = await response.json();

        if (response.ok) {
            const expirationTime = rememberMe ? Date.now() + (14 * 24 * 60 * 60 * 1000) : Date.now() + (1 * 60 * 60 * 1000);

            chrome.storage.local.set({ "jwt_token": data.access_token, "jwt_expiration": expirationTime }, function() {
                onLoginSuccess();
            });
        } else {
            showError("Identifiants incorrects");
        }
    } catch (error) {
        showError("Impossible de contacter le serveur.");
    }
}

function setupLoginForm() {
    console.log("setupLoginForm exécuté");
    document.getElementById("login-form").addEventListener("submit", function(event) {
        event.preventDefault();
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        const rememberMe = document.getElementById("remember-me").checked;
        loginUser(email, password, rememberMe);
    });
}

function checkLoginStatus() {
    chrome.storage.local.get(["jwt_token", "jwt_expiration"], function(data) {
        const now = Date.now();
        const loginContainer = document.getElementById("login-container");
        const appPage = document.getElementById("app-page");

        if (!loginContainer || !appPage) return;

        if (data.jwt_token && data.jwt_expiration && now < data.jwt_expiration) {
            loginContainer.style.display = "none";
            appPage.style.display = "block";
            setActiveTab("list-page", document.getElementById("btn-list"));
        } else {
            chrome.storage.local.remove(["jwt_token", "jwt_expiration"]);
            loginContainer.style.display = "block";
            appPage.style.display = "none";
        }
    });
}

// List page

// Fonction pour charger et afficher la liste des identifiants
function loadIdentifiers() {
    const identifiersList = document.getElementById("identifiers-list");

    // Exemple de données (à remplacer par un appel à la DB)
    const exampleData = [
        { site: "github.com", email: "dev@github.com", icon: "icons/placeholder.svg" },
        { site: "amazon.fr", email: "user@amazon.fr", icon: "icons/placeholder.svg" },
        { site: "google.com", email: "test@gmail.com", icon: "icons/placeholder.svg" },
        { site: "facebook.com", email: "fbuser@yahoo.com", icon: "icons/placeholder.svg" },
        { site: "linkedin.com", email: "pro@linkedin.com", icon: "icons/placeholder.svg" },
        { site: "twitter.com", email: "tweet@twitter.com", icon: "icons/placeholder.svg" },
        { site: "microsoft.com", email: "msuser@outlook.com", icon: "icons/placeholder.svg" },
        { site: "apple.com", email: "appleid@icloud.com", icon: "icons/placeholder.svg" },
        { site: "netflix.com", email: "stream@netflix.com", icon: "icons/placeholder.svg" },
        { site: "spotify.com", email: "music@spotify.com", icon: "icons/placeholder.svg" },
        { site: "paypal.com", email: "pay@paypal.com", icon: "icons/placeholder.svg" },
        { site: "reddit.com", email: "meme@reddit.com", icon: "icons/placeholder.svg" },
        { site: "discord.com", email: "gamer@discord.com", icon: "icons/placeholder.svg" },
        { site: "yahoo.com", email: "oldmail@yahoo.com", icon: "icons/placeholder.svg" },
        { site: "instagram.com", email: "photo@instagram.com", icon: "icons/placeholder.svg" },
        { site: "ebay.com", email: "seller@ebay.com", icon: "icons/placeholder.svg" },
        { site: "stackoverflow.com", email: "coder@stackoverflow.com", icon: "icons/placeholder.svg" },
        { site: "twitch.tv", email: "streamer@twitch.tv", icon: "icons/placeholder.svg" },
        { site: "dropbox.com", email: "cloud@dropbox.com", icon: "icons/placeholder.svg" },
        { site: "zoom.us", email: "meetings@zoom.us", icon: "icons/placeholder.svg" }
        ];

    // Effacer le contenu précédent
    identifiersList.innerHTML = "";

    // Ajouter chaque identifiant à la liste
    exampleData.forEach(item => {
        const identifierItem = document.createElement("button");
        identifierItem.classList.add("identifier-item");

        identifierItem.innerHTML = `
            <img src="${item.icon}" alt="Icône du site">
            <div class="identifier-info">
                <span class="site-url">${item.site}</span>
                <span class="email">${item.email}</span>
            </div>
        `;

        identifiersList.appendChild(identifierItem);
    });
}

document.addEventListener("DOMContentLoaded", function() {
    loadIdentifiers();
});