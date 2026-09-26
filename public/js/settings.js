async function renderSettings() {

    document.getElementById("app").innerHTML = `

        <div class="settings-page">

            <header class="topbar">

                <strong>
                    ${t("settings")}
                </strong>

                <button
                    onclick="navigate('/messages')"
                >
                    ${t("messages")}
                </button>

            </header>

            <main class="settings-content">

                <section class="card settings-card">

                    <h2>
                        ${t("profile")}
                    </h2>

                    <label>
                        ${t("displayName")}
                    </label>

                    <input
                        id="display-name"
                        value="${escapeHtml(
                            state.user.display_name
                        )}"
                        maxlength="35"
                    >

                    <button
                        class="primary-button"
                        onclick="saveProfile()"
                    >
                        ${t("save")}
                    </button>

                </section>

                <section class="card settings-card">

                    <h2>
                        ${t("language")}
                    </h2>

                    <select
                        onchange="setLanguage(this.value)"
                    >

                        <option value="en">
                            English
                        </option>

                        <option value="tr">
                            Türkçe
                        </option>

                        <option value="fr">
                            Français
                        </option>

                        <option value="it">
                            Italiano
                        </option>

                        <option value="de">
                            Deutsch
                        </option>

                        <option value="ru">
                            Русский
                        </option>

                        <option value="pt">
                            Português
                        </option>

                    </select>

                </section>

                <section class="card settings-card">

                    <h2>
                        ${t("appearance")}
                    </h2>

                    <select
                        onchange="setTheme(this.value)"
                    >

                        <option value="dark">
                            ${t("dark")}
                        </option>

                        <option value="light">
                            ${t("light")}
                        </option>

                        <option value="system">
                            ${t("system")}
                        </option>

                    </select>

                </section>

                <section class="card settings-card">

                    <button
                        class="secondary-button"
                        onclick="logout()"
                    >
                        ${t("logout")}
                    </button>

                </section>

            </main>

        </div>
    `;
}

async function saveProfile() {

    const displayName =
        document.getElementById(
            "display-name"
        ).value.trim();

    await api("/profile", {

        method: "PATCH",

        body: JSON.stringify({
            displayName
        })

    });

    await loadUser();

    alert("Saved.");
}

async function logout() {

    await api("/logout", {
        method: "POST"
    });

    state.user = null;

    navigate("/login");
}

function setTheme(theme) {

    localStorage.setItem(
        "blinkmsg-theme",
        theme
    );

    document.documentElement
        .setAttribute(
            "data-theme",
            theme
        );
}
