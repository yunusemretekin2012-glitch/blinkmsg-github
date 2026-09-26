async function renderMessages() {

    const users = await api("/users");

    document.getElementById("app").innerHTML = `

        <div class="messenger">

            <aside class="sidebar">

                <h2>BlinkMsg</h2>

                <input
                    placeholder="${t("search")}"
                    oninput="filterUsers(this.value)"
                >

                <div id="users">

                    ${users
                        .map(userCard)
                        .join("")}

                </div>

                <div class="sidebar-bottom">

                    <button onclick="navigate('/profile')">
                        ${t("profile")}
                    </button>

                    <button onclick="navigate('/settings')">
                        ${t("settings")}
                    </button>

                </div>

            </aside>

            <main class="chat">

                <header id="chat-header">
                    ${t("newMessage")}
                </header>

                <div id="chat-messages">
                    <div class="empty">
                        Select a person to start chatting.
                    </div>
                </div>

                <form
                    class="message-input"
                    onsubmit="sendMessage(event)"
                >

                    <input
                        id="message"
                        placeholder="Write a message..."
                        maxlength="2000"
                        autocomplete="off"
                    >

                    <button>
                        ${t("send")}
                    </button>

                </form>

            </main>

        </div>
    `;
}

function userCard(user) {

    return `

        <button
            class="user-card"
            onclick="openChat('${user.username}')"
        >

            <div class="user-avatar">

                ${
                    user.avatar
                    ? `<img src="${user.avatar}">`
                    : user.display_name[0].toUpperCase()
                }

            </div>

            <div>

                <strong>
                    ${escapeHtml(user.display_name)}
                </strong>

                <small>
                    @${escapeHtml(user.username)}
                </small>

            </div>

        </button>
    `;
}

async function openChat(username) {

    const user =
        await api(
            "/users/" +
            encodeURIComponent(username)
        );

    state.selectedUser = user;

    document.getElementById(
        "chat-header"
    ).innerHTML = `

        <strong>
            ${escapeHtml(user.display_name)}
        </strong>

        <small>
            @${escapeHtml(user.username)}
        </small>
    `;

    loadMessages();
}

async function loadMessages() {

    if (!state.selectedUser) return;

    const messages =
        await api(
            "/messages/" +
            encodeURIComponent(
                state.selectedUser.username
            )
        );

    const container =
        document.getElementById(
            "chat-messages"
        );

    container.innerHTML =
        messages.map(message => `

            <div class="
                message
                ${
                    message.sender_id === state.user.id
                        ? "mine"
                        : ""
                }
            ">

                ${escapeHtml(message.message)}

            </div>

        `).join("");

    container.scrollTop =
        container.scrollHeight;
}

async function sendMessage(event) {

    event.preventDefault();

    if (!state.selectedUser) return;

    const input =
        document.getElementById("message");

    const message =
        input.value.trim();

    if (!message) return;

    await api("/messages", {

        method: "POST",

        body: JSON.stringify({

            username:
                state.selectedUser.username,

            message

        })

    });

    input.value = "";

    await loadMessages();
}

function filterUsers(query) {

    query =
        query.toLowerCase();

    document
        .querySelectorAll(".user-card")
        .forEach(card => {

            card.style.display =
                card.textContent
                    .toLowerCase()
                    .includes(query)
                    ? ""
                    : "none";
        });
}

function escapeHtml(text) {

    return String(text)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}
