$(document).ready(function(){

    function logout() {
        User.logout();
        location.href = "login.html";
    }
    function initNavProfile() {
        $(".profile-info").html(User.first_name + " " + User.last_name)
        $(".header-nav-profile .logout").click(logout);
    }

    User.onAuthenticated(initNavProfile);
});
