async function renderProfile(username) {

    const user =
        await api(
            "/users/" +
            encodeURIComponent(username)
        );

    document.getElementById("app").innerHTML = `

        <div class="profile-page">

            <nav class="topbar">

                <strong>BlinkMsg</strong>

                <div>

                    <button
                        onclick="navigate('/messages')"
                    >
                        ${t("messages")}
                    </button>

                    <button
                        onclick="navigate('/settings')"
                    >
                        ${t("settings")}
                    </button>

                </div>

            </nav>

            <main class="profile-card">

                <div class="profile-avatar">

                    ${
                        user.avatar
                        ? `<img src="${user.avatar}">`
                        : user.display_name[0]
                    }

                </div>

                <h1>
                    ${escapeHtml(user.display_name)}
                </h1>

                <p>
                    @${escapeHtml(user.username)}
                </p>

                ${
                    username !== state.user.username
                    ? `
                        <button
                            class="primary-button"
                            onclick="navigate('/messages')"
                        >
                            ${t("messages")}
                        </button>
                    `
                    : ""
                }

            </main>

        </div>
    `;
}
