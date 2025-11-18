(function () {
    const ROLE_KEY = "laVerdadRole";

    const syncJournalistMode = () => {
        const isJournalist = localStorage.getItem(ROLE_KEY) === "journalist";
        if (document.body) {
            document.body.classList.toggle("is-journalist", isJournalist);
            if (isJournalist) {
                document.body.setAttribute("data-user-role", "journalist");
            } else {
                document.body.removeAttribute("data-user-role");
            }
        }
        document.querySelectorAll("[data-journalist-link]").forEach((node) => {
            if (isJournalist) {
                node.removeAttribute("hidden");
            } else {
                node.setAttribute("hidden", "");
            }
        });
    };

    syncJournalistMode();
    document.addEventListener("laverdad:role-change", syncJournalistMode);
    window.addEventListener("storage", (event) => {
        if (!event || event.key === ROLE_KEY) {
            syncJournalistMode();
        }
    });

    const dock = document.querySelector("[data-access-dock]");
    const panel = document.querySelector("[data-access-panel]");
    if (!dock || !panel) {
        return;
    }

    const fab = dock.querySelector(".accessibility-fab");
    const dockToggle = dock.querySelector("[data-dock-toggle]");
    const closePanelBtn = panel.querySelector(".panel-close");
    const switchButtons = panel.querySelectorAll(".access-switch");
    const textButtons = panel.querySelectorAll(".text-scale-button");
    const scaleLabel = panel.querySelector("[data-text-scale]");
    const fontChoices = panel.querySelectorAll(".font-choice");
    const openTriggers = document.querySelectorAll("[data-open-access-panel]");

    const COLLAPSE_KEY = "lv-access-dock-collapsed";
    const SCALE_KEY = "lv-access-text-scale";
    const FONT_KEY = "lv-access-font";

    let dockCollapsed = localStorage.getItem(COLLAPSE_KEY) === "true";
    let textScale = parseFloat(localStorage.getItem(SCALE_KEY));
    if (!Number.isFinite(textScale)) {
        textScale = 1;
    }

    const syncDockState = () => {
        dock.classList.toggle("is-collapsed", dockCollapsed);
        if (dockToggle) {
            dockToggle.textContent = dockCollapsed ? "<" : ">";
            dockToggle.setAttribute(
                "aria-label",
                dockCollapsed ? "Mostrar opciones de accesibilidad" : "Ocultar opciones de accesibilidad"
            );
        }
        if (dockCollapsed && panel.classList.contains("is-visible")) {
            closePanel();
        }
        localStorage.setItem(COLLAPSE_KEY, String(dockCollapsed));
    };

    const applyScale = () => {
        const clamped = Math.min(1.4, Math.max(0.85, textScale));
        textScale = clamped;
        document.documentElement.style.setProperty("--text-scale", clamped);
        if (scaleLabel) {
            scaleLabel.textContent = Math.round(clamped * 100) + "%";
        }
        localStorage.setItem(SCALE_KEY, String(clamped));
    };

    const applyFontChoice = (fontClass) => {
        const target = fontClass || "font-accessible";
        document.body.classList.remove("font-accessible", "font-dyslexic");
        document.body.classList.add(target);
        fontChoices.forEach((item) => {
            item.setAttribute("aria-checked", item.dataset.fontClass === target ? "true" : "false");
        });
        localStorage.setItem(FONT_KEY, target);
    };

    const openPanel = () => {
        panel.classList.add("is-visible");
        panel.setAttribute("aria-hidden", "false");
        fab?.setAttribute("aria-expanded", "true");
        dock.classList.add("is-hidden");
    };

    const closePanel = () => {
        panel.classList.remove("is-visible");
        panel.setAttribute("aria-hidden", "true");
        fab?.setAttribute("aria-expanded", "false");
        dock.classList.remove("is-hidden");
        syncDockState();
    };

    fab?.addEventListener("click", () => {
        if (panel.classList.contains("is-visible")) {
            closePanel();
        } else {
            openPanel();
        }
    });

    dockToggle?.addEventListener("click", () => {
        dockCollapsed = !dockCollapsed;
        syncDockState();
    });

    closePanelBtn?.addEventListener("click", closePanel);

    switchButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
            const current = btn.getAttribute("aria-checked") === "true";
            const nextState = !current;
            btn.setAttribute("aria-checked", String(nextState));
            const targetClass = btn.dataset.toggleClass;
            if (targetClass) {
                document.body.classList.toggle(targetClass, nextState);
            }
        });
    });

    textButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
            const delta = parseFloat(btn.dataset.scaleStep);
            if (!Number.isFinite(delta)) {
                return;
            }
            textScale += delta;
            applyScale();
        });
    });

    fontChoices.forEach((choice) => {
        choice.addEventListener("click", () => {
            applyFontChoice(choice.dataset.fontClass);
        });
    });

    openTriggers.forEach((btn) => {
        btn.addEventListener("click", () => {
            if (typeof window.LaVerdadCloseDrawer === "function") {
                window.LaVerdadCloseDrawer();
            }
            openPanel();
        });
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && panel.classList.contains("is-visible")) {
            closePanel();
        }
    });

    document.addEventListener("click", (event) => {
        if (
            panel.classList.contains("is-visible") &&
            !panel.contains(event.target) &&
            !dock.contains(event.target)
        ) {
            closePanel();
        }
    });

    syncDockState();
    applyScale();
    const savedFont = localStorage.getItem(FONT_KEY) || "font-accessible";
    applyFontChoice(savedFont);

    window.LaVerdadAccessibility = {
        open: openPanel,
        close: closePanel,
        isOpen: () => panel.classList.contains("is-visible"),
    };
})();
