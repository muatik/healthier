function redirectToLogin() {
    location.href = "login.html"
}


if (!User.login_data)
    redirectToLogin();

$(document).ready(function(){

    function logout() {
        User.logout();
        location.href = "login.html";
    }

    function initNavProfile() {
        updateProfileView();
        $(".logout").click(function(){
            User.logout();
            redirectToLogin();
        })
    }

    if (User.login_data)
        User.onAuthenticated(initNavProfile);
});



function updateProfileView() {
    var photo = $(".user-profile .avatar");
    if (User.userprofile.gender == 1)
        photo.prop("src", "assets/img/man_avatar.png")
    else
        photo.prop("src", "assets/img/female_avatar.png")

    $(".user-profile .name").html(User.first_name + " " + User.last_name)
}

