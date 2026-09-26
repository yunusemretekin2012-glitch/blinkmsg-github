const state = {
    user: null,
    selectedUser: null
};

async function loadUser() {

    try {

        state.user = await api("/me");

    } catch {

        state.user = null;
    }
}

function navigate(path) {

    history.pushState({}, "", path);

    render();
}

window.addEventListener(
    "popstate",
    render
);

async function render() {

    await loadUser();

    const path = location.pathname;

    if (!state.user) {

        if (path === "/register") {
            renderRegister();
        } else {
            renderLogin();
        }

        return;
    }

    if (path === "/messages") {
        renderMessages();
        return;
    }

    if (path === "/profile") {
        renderProfile(state.user.username);
        return;
    }

    if (path.startsWith("/profile/")) {

        const username =
            decodeURIComponent(
                path.split("/")[2]
            );

        renderProfile(username);

        return;
    }

    if (path === "/settings") {
        renderSettings();
        return;
    }

    navigate("/messages");
}

document.addEventListener(
    "DOMContentLoaded",
    render
);
