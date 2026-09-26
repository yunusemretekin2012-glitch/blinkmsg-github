const translations = {

    en: {
        login: "Log in",
        register: "Create account",
        username: "Username",
        displayName: "Display name",
        password: "Password",
        confirmPassword: "Confirm password",

        messages: "Messages",
        profile: "Profile",
        settings: "Settings",

        send: "Send",
        logout: "Log out",

        captcha: "Robot verification",
        captchaInput: "Enter the number",

        search: "Search people",

        newMessage: "New message",

        save: "Save changes",

        changePassword: "Change password",

        language: "Language",
        appearance: "Appearance",

        dark: "Dark",
        light: "Light",
        system: "System"
    },

    tr: {
        login: "Giriş Yap",
        register: "Hesap Oluştur",
        username: "Kullanıcı adı",
        displayName: "Görünen ad",
        password: "Şifre",
        confirmPassword: "Şifre (tekrar)",

        messages: "Mesajlar",
        profile: "Profil",
        settings: "Ayarlar",

        send: "Gönder",
        logout: "Çıkış Yap",

        captcha: "Robot doğrulaması",
        captchaInput: "Sayıyı girin",

        search: "Kişi ara",

        newMessage: "Yeni mesaj",

        save: "Değişiklikleri kaydet",

        changePassword: "Şifre değiştir",

        language: "Dil",
        appearance: "Görünüm",

        dark: "Koyu",
        light: "Açık",
        system: "Sistem"
    },

    fr: {
        login: "Se connecter",
        register: "Créer un compte",
        username: "Nom d’utilisateur",
        displayName: "Nom affiché",
        password: "Mot de passe",
        confirmPassword: "Confirmer le mot de passe",
        messages: "Messages",
        profile: "Profil",
        settings: "Paramètres",
        send: "Envoyer",
        logout: "Se déconnecter",
        language: "Langue"
    },

    it: {
        login: "Accedi",
        register: "Crea account",
        username: "Nome utente",
        displayName: "Nome visualizzato",
        password: "Password",
        messages: "Messaggi",
        profile: "Profilo",
        settings: "Impostazioni",
        send: "Invia",
        logout: "Esci"
    },

    de: {
        login: "Anmelden",
        register: "Konto erstellen",
        username: "Benutzername",
        displayName: "Anzeigename",
        password: "Passwort",
        messages: "Nachrichten",
        profile: "Profil",
        settings: "Einstellungen",
        send: "Senden",
        logout: "Abmelden"
    },

    ru: {
        login: "Войти",
        register: "Создать аккаунт",
        username: "Имя пользователя",
        displayName: "Отображаемое имя",
        password: "Пароль",
        messages: "Сообщения",
        profile: "Профиль",
        settings: "Настройки",
        send: "Отправить",
        logout: "Выйти"
    },

    pt: {
        login: "Entrar",
        register: "Criar conta",
        username: "Nome de usuário",
        displayName: "Nome exibido",
        password: "Senha",
        messages: "Mensagens",
        profile: "Perfil",
        settings: "Configurações",
        send: "Enviar",
        logout: "Sair"
    }
};

let currentLanguage =
    localStorage.getItem("blinkmsg-language") || "en";

function t(key) {

    return (
        translations[currentLanguage]?.[key] ||
        translations.en[key] ||
        key
    );
}

function setLanguage(language) {

    currentLanguage = language;

    localStorage.setItem(
        "blinkmsg-language",
        language
    );

    location.reload();
}
