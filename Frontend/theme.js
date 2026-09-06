(function () {
    const storageKey = "flyvora-theme";
    const savedTheme = localStorage.getItem(storageKey);
    const prefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;
    const initialTheme = savedTheme || (prefersLight ? "light" : "dark");

    function applyTheme(theme) {
        const isLight = theme === "light";
        document.body.classList.toggle("light-theme", isLight);
        document.documentElement.style.colorScheme = theme;

        const toggle = document.querySelector(".theme-toggle");
        if (!toggle) return;
        toggle.setAttribute("aria-pressed", String(isLight));
        toggle.setAttribute("aria-label", isLight ? "Switch to dark theme" : "Switch to light theme");
        toggle.querySelector(".theme-toggle-icon").textContent = isLight ? "☾" : "☀";
        toggle.querySelector(".theme-toggle-label").textContent = isLight ? "Dark" : "Light";
    }

    function addThemeToggle() {
        const nav = document.querySelector("#primary-nav");
        if (!nav || nav.querySelector(".theme-toggle")) return;

        const item = document.createElement("li");
        item.innerHTML = '<button type="button" class="theme-toggle" aria-pressed="false"><span class="theme-toggle-icon" aria-hidden="true">☀</span><span class="theme-toggle-label">Light</span></button>';
        nav.querySelector("ul").appendChild(item);
        item.querySelector(".theme-toggle").addEventListener("click", function () {
            const nextTheme = document.body.classList.contains("light-theme") ? "dark" : "light";
            localStorage.setItem(storageKey, nextTheme);
            applyTheme(nextTheme);
        });
        applyTheme(initialTheme);
    }

    document.addEventListener("DOMContentLoaded", function () {
        applyTheme(initialTheme);
        addThemeToggle();
    });
})();