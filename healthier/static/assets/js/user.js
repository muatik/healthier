User = {
    authenticated: false,
}

User.login = function(email, password) {
    User.clearCookies();

    this.email = email;
    this.username = email;
    this.password = password;

    User._ajax = User.ajax({
        url: "/api/users/me"
    }).error(function(e){
        User.authenticated = false;
    }).done(function(res){
        $.extend(User, res)
        User.authenticated = true;
        User.setCookies();
    });
    return User._ajax;
}

User.logout = function() {
    this.clearCookies();
}

User.onAuthenticated = function(f) {
    if (User.authenticated)
        f()
    else if (User._ajax)
        User._ajax.done(f)
}

User.setCookies = function() {
    Cookies.set("email", this.email);
    Cookies.set("username", this.username);
    Cookies.set("password", this.password);
}

User.clearCookies = function() {
    Cookies.remove("email");
    Cookies.remove("username");
    Cookies.remove("password");
}

User.getBasicAuth = function() {
    return "Basic " + btoa(this.username + ":" + this.password)
}

User.ajax = function(options) {

    var defaults = {
        headers: {
            "Authorization": "Basic " + btoa(this.username + ":" + this.password)
        }
    };

    $.extend(options,defaults);
    return $.ajax(options);
}

User.autoLogin = function() {
    var email = Cookies.get("email");
    var password = Cookies.get("password");
    if (email && password) {
        User.login(email, password)
    }
}

User.autoLogin()