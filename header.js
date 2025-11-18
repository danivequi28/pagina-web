(function () {
    const header = document.querySelector("[data-global-header]");
    if (!header) {
        return;
    }

    const navOverlay = document.querySelector("[data-nav-overlay]");
    const menuToggleBtn = header.querySelector(".menu-toggle");
    const drawerCloseBtn = document.querySelector("[data-drawer-close]");

    const openDrawer = () => {
        if (!navOverlay) return;
        navOverlay.classList.add("is-visible");
        navOverlay.setAttribute("aria-hidden", "false");
        document.body.classList.add("menu-open");
        menuToggleBtn?.setAttribute("aria-expanded", "true");
    };

    const closeDrawer = () => {
        if (!navOverlay) return;
        navOverlay.classList.remove("is-visible");
        navOverlay.setAttribute("aria-hidden", "true");
        document.body.classList.remove("menu-open");
        menuToggleBtn?.setAttribute("aria-expanded", "false");
    };

    window.LaVerdadCloseDrawer = closeDrawer;

    const toggleDrawer = () => {
        if (!navOverlay) return;
        if (navOverlay.classList.contains("is-visible")) {
            closeDrawer();
        } else {
            openDrawer();
        }
    };

    menuToggleBtn?.addEventListener("click", toggleDrawer);
    drawerCloseBtn?.addEventListener("click", closeDrawer);
    navOverlay?.addEventListener("click", (event) => {
        if (event.target === navOverlay) {
            closeDrawer();
        }
    });
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && navOverlay?.classList.contains("is-visible")) {
            closeDrawer();
        }
    });

    const markActiveTopic = () => {
        const topic = document.body.dataset.topic;
        if (!topic) {
            return;
        }
        document.querySelectorAll("[data-topic-link]").forEach((link) => {
            link.classList.toggle("topic-active", link.dataset.topicLink === topic);
        });
    };

    window.LaVerdadMarkTopicActive = markActiveTopic;
    markActiveTopic();

    const languageSelectors = document.querySelectorAll("[data-language]");
    languageSelectors.forEach((languageSelector) => {
        const languageToggle = languageSelector.querySelector(".language-toggle");
        const languageMenu = languageSelector.querySelector(".language-menu");
        const languageOptions = languageSelector.querySelectorAll("[data-lang-option]");
        const currentLang = languageSelector.querySelector("[data-current-lang]");

        const openLanguageMenu = () => {
            languageMenu?.classList.add("open");
            languageToggle?.setAttribute("aria-expanded", "true");
        };

        const closeLanguageMenu = () => {
            languageMenu?.classList.remove("open");
            languageToggle?.setAttribute("aria-expanded", "false");
        };

        languageToggle?.addEventListener("click", (event) => {
            event.stopPropagation();
            if (languageMenu?.classList.contains("open")) {
                closeLanguageMenu();
            } else {
                openLanguageMenu();
            }
        });

        document.addEventListener("click", (event) => {
            if (languageMenu && !languageMenu.contains(event.target) && event.target !== languageToggle) {
                closeLanguageMenu();
            }
        });

        languageOptions.forEach((option) => {
            option.addEventListener("click", () => {
                const lang = option.dataset.langOption;
                if (currentLang && lang) {
                    currentLang.textContent = lang;
                }
                closeLanguageMenu();
            });
        });
    });

    const toolsMenu = document.querySelector("[data-tools-menu]");
    if (toolsMenu) {
        const toolsToggle = toolsMenu.querySelector(".tools-toggle");
        toolsToggle?.setAttribute("aria-expanded", "false");
        const closeTools = () => {
            toolsMenu.classList.remove("is-open");
            toolsToggle?.setAttribute("aria-expanded", "false");
        };
        toolsToggle?.addEventListener("click", (event) => {
            event.stopPropagation();
            const isOpen = toolsMenu.classList.toggle("is-open");
            toolsToggle?.setAttribute("aria-expanded", String(isOpen));
        });
        document.addEventListener("click", (event) => {
            if (!toolsMenu.contains(event.target)) {
                closeTools();
            }
        });
    }

    const loginLinkEl = header.querySelector("[data-login-link]");
    const userPillEl = header.querySelector("[data-user-pill]");
    const topDivider = header.querySelector("[data-top-divider]");
    const drawerGuestBlocks = Array.from(document.querySelectorAll("[data-drawer-guest]"));
    const drawerUserBlocks = Array.from(document.querySelectorAll("[data-drawer-user]"));
    const drawerUsernameSpans = Array.from(document.querySelectorAll("[data-drawer-username]"));
    const drawerUserLinks = Array.from(document.querySelectorAll("[data-drawer-userlink]"));

    const ROLE_KEY = "laVerdadRole";
    const params = new URLSearchParams(window.location.search);
    const incomingUser = params.get("user");
    const isLogout = params.has("logout");

    if (isLogout) {
        localStorage.removeItem("laVerdadUser");
        localStorage.removeItem(ROLE_KEY);
        document.dispatchEvent(new CustomEvent("laverdad:role-change"));
        if (history.replaceState) {
            history.replaceState({}, document.title, window.location.pathname);
        }
    }

    if (incomingUser) {
        const safeName = incomingUser.trim();
        if (safeName) {
            localStorage.setItem("laVerdadUser", safeName);
        }
        if (history.replaceState) {
            history.replaceState({}, document.title, window.location.pathname);
        }
    }

    const renderUserState = () => {
        const storedUser = localStorage.getItem("laVerdadUser");
        if (!loginLinkEl || !userPillEl || !topDivider) {
            return;
        }
        if (storedUser) {
            userPillEl.innerHTML = `${storedUser} <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><circle cx="12" cy="8" r="4"></circle><path d="M4 21c1.6-4 4.4-6 8-6s6.4 2 8 6"></path></svg>`;
            userPillEl.style.display = "inline-flex";
            userPillEl.dataset.username = storedUser;
            loginLinkEl.style.display = "none";
            topDivider.style.display = "inline";
            drawerGuestBlocks.forEach((guest) => (guest.style.display = "none"));
            drawerUserBlocks.forEach((userBlock) => {
                userBlock.style.display = "flex";
            });
            drawerUsernameSpans.forEach((span) => (span.textContent = storedUser));
            drawerUserLinks.forEach((link) =>
                link.setAttribute("href", `perfil.html?user=${encodeURIComponent(storedUser)}`)
            );
        } else {
            userPillEl.style.display = "none";
            userPillEl.removeAttribute("data-username");
            loginLinkEl.style.display = "inline";
            topDivider.style.display = "inline";
            drawerGuestBlocks.forEach((guest) => (guest.style.display = "flex"));
            drawerUserBlocks.forEach((userBlock) => (userBlock.style.display = "none"));
        }
    };

    renderUserState();

    userPillEl?.addEventListener("click", (event) => {
        const storedUser = localStorage.getItem("laVerdadUser");
        if (!storedUser) {
            event.preventDefault();
            loginLinkEl?.click();
            return;
        }
        userPillEl.setAttribute("href", `perfil.html?user=${encodeURIComponent(storedUser)}`);
    });

    document.querySelectorAll("[data-drawer-login]").forEach((el) =>
        el.addEventListener("click", closeDrawer)
    );
    document.querySelectorAll("[data-drawer-register]").forEach((el) =>
        el.addEventListener("click", closeDrawer)
    );

    const logoutButtons = document.querySelectorAll("[data-drawer-logout]");
    if (logoutButtons.length) {
        logoutButtons.forEach((btn) => {
            btn.addEventListener("click", () => {
                localStorage.removeItem("laVerdadUser");
                localStorage.removeItem("laVerdadEmail");
                localStorage.removeItem(ROLE_KEY);
                document.dispatchEvent(new CustomEvent("laverdad:role-change"));
                renderUserState();
                closeDrawer();
                window.location.href = "archivp.html";
            });
        });
    }
})();
