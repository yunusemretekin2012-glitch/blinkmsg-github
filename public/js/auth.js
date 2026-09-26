let captchaImage = "";

async function getCaptcha() {
    const data = await api("/captcha");
    captchaImage = data.image;
}

function authLayout(content) {
    document.getElementById("app").innerHTML = `

        <div class="auth-page">

            <div class="auth-box">

                <div class="auth-brand">

                    <img
                        src="https://i.hizliresim.com/fbm9nfzc.png"
                        alt="BlinkMsg"
                    >

                    <h1>BlinkMsg</h1>

                    <p>
                        Simple, private and fast messaging.
                    </p>

                </div>

                <div class="auth-form">

                    ${content}

                </div>

            </div>

        </div>
    `;
}


/* =========================
   LOGIN
========================= */

async function renderLogin() {

    await getCaptcha();

    authLayout(`

        <div class="auth-tabs">

            <button
                class="active"
                onclick="navigate('/login')"
                type="button"
            >
                ${t("login")}
            </button>

            <button
                onclick="navigate('/register')"
                type="button"
            >
                ${t("register")}
            </button>

        </div>

        <div id="auth-error"></div>

        <form onsubmit="login(event)">

            <div class="form-group">

                <label>
                    ${t("username")}
                </label>

                <input
                    name="username"
                    autocomplete="username"
                    autocapitalize="none"
                    maxlength="24"
                    required
                >

            </div>

            <div class="form-group">

                <label>
                    ${t("password")}
                </label>

                <input
                    name="password"
                    type="password"
                    autocomplete="current-password"
                    required
                >

            </div>

            <div class="form-group">

                <label>
                    ${t("captcha")}
                </label>

                <div class="captcha">

                    <img
                        src="${captchaImage}"
                        alt="Robot verification"
                    >

                    <input
                        name="captcha"
                        inputmode="numeric"
                        autocomplete="off"
                        placeholder="${t("captchaInput")}"
                        required
                    >

                </div>

            </div>

            <button
                class="primary-button"
                type="submit"
            >
                ${t("login")}
            </button>

        </form>

    `);
}


/* =========================
   REGISTER
========================= */

async function renderRegister() {

    await getCaptcha();

    authLayout(`

        <div class="auth-tabs">

            <button
                onclick="navigate('/login')"
                type="button"
            >
                ${t("login")}
            </button>

            <button
                class="active"
                type="button"
            >
                ${t("register")}
            </button>

        </div>

        <div id="auth-error"></div>

        <form onsubmit="register(event)">

            <div class="form-group">

                <label>
                    ${t("username")}
                </label>

                <input
                    name="username"
                    maxlength="24"
                    autocapitalize="none"
                    autocomplete="username"
                    required
                >

            </div>

            <div class="form-group">

                <label>
                    ${t("displayName")}
                </label>

                <input
                    name="displayName"
                    maxlength="35"
                    required
                >

            </div>

            <div class="form-group">

                <label>
                    ${t("password")}
                </label>

                <input
                    name="password"
                    type="password"
                    autocomplete="new-password"
                    required
                >

            </div>

            <div class="form-group">

                <label>
                    ${t("confirmPassword")}
                </label>

                <input
                    name="confirmPassword"
                    type="password"
                    autocomplete="new-password"
                    required
                >

            </div>

            <div class="form-group">

                <label>
                    ${t("captcha")}
                </label>

                <div class="captcha">

                    <img
                        src="${captchaImage}"
                        alt="Robot verification"
                    >

                    <input
                        name="captcha"
                        inputmode="numeric"
                        autocomplete="off"
                        placeholder="${t("captchaInput")}"
                        required
                    >

                </div>

            </div>

            <button
                class="primary-button"
                type="submit"
            >
                ${t("register")}
            </button>

        </form>

    `);
}


/* =========================
   LOGIN REQUEST
========================= */

async function login(event) {

    event.preventDefault();

    const form =
        new FormData(event.target);

    const username =
        String(form.get("username") || "")
            .toLowerCase()
            .trim();

    const password =
        String(form.get("password") || "");

    const captchaAnswer =
        String(form.get("captcha") || "")
            .trim();

    try {

        await api("/login", {

            method: "POST",

            body: JSON.stringify({

                username: username,

                password: password,

                captchaAnswer: captchaAnswer

            })

        });

        navigate("/messages");

    } catch (error) {

        document.getElementById(
            "auth-error"
        ).innerHTML = `
            <div class="error">
                ${escapeHtml(error.message)}
            </div>
        `;

        // Yeni CAPTCHA oluştur
        await renderLogin();
    }
}


/* =========================
   REGISTER REQUEST
========================= */

async function register(event) {

    event.preventDefault();

    const form =
        new FormData(event.target);

    const username =
        String(form.get("username") || "")
            .toLowerCase()
            .trim();

    const displayName =
        String(form.get("displayName") || "")
            .trim();

    const password =
        String(form.get("password") || "");

    const confirmPassword =
        String(form.get("confirmPassword") || "");

    const captchaAnswer =
        String(form.get("captcha") || "")
            .trim();

    try {

        await api("/register", {

            method: "POST",

            body: JSON.stringify({

                username: username,

                displayName: displayName,

                password: password,

                confirmPassword: confirmPassword,

                captchaAnswer: captchaAnswer

            })

        });

        navigate("/messages");

    } catch (error) {

        document.getElementById(
            "auth-error"
        ).innerHTML = `
            <div class="error">
                ${escapeHtml(error.message)}
            </div>
        `;
    }
}
