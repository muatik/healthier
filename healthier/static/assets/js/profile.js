
function initProfile() {

    $("#profile-firstname").val(User.first_name);
    $("#profile-lastname").val(User.last_name);
    $("#profile-email").val(User.email);

    if (User.userprofile.gender == 1)
        $("#profle-gender-male").prop('checked', true);
    else
        $("#profle-gender-female").prop('checked', true);

    $("#profile-height").val(User.userprofile.height);

    $('#profle-birth-date').datepicker({
        maxDate : 'now',
        startDate : new Date('1900-08-08'),
        endDate : new Date(),
        autoclose: true,
        todayHighlight: true});

    $('#profle-birth-date').datepicker('setDate', new Date(User.userprofile.birth_date));

    $("#profile-edit-card form").submit(function(e){
        e.preventDefault();

        var data = {
            "first_name": $("#profile-firstname").val(),
            "last_name": $("#profile-lastname").val(),
            "email": $("#profile-email").val(),
            "username": $("#profile-email").val(),
            "password": User.password,
            "userprofile": {
                "gender": $("input[name='profile-gender']:checked").val(),
                "birth_date": $("#profle-birth-date").data('datepicker').getFormattedDate('yyyy-mm-dd'),
                "height": $("#profile-height").val(),
            }
        };

        var error_alert = $(".error-message", this);
        error_alert.hide();

        User.change(data, {
            success: function() {
                updateProfileView()
                toastr.success("updated successfully")
            },
            error: function(res) {
                var errors = JSON.parse(res.responseText);
                error_alert.show()
                for(var i in errors) {
                    error_alert.find("span").html(i + ": " + errors[i]);
                    break;
                }
                console.log(res)
            }
        });

    });

}

function initWeightView() {
    $("#weight-view-date").datepicker("setDate", new Date());
    $("#weight-view-date").datepicker("update");

    $("#weight-card form").submit(function(e){
        e.preventDefault();
        var date = $("#weight-view-date").data('datepicker').getFormattedDate('yyyy-mm-dd');
        var weight = $("#weight-view-weight").val();
        Weights.insertWeight(date, weight, {
            success: function() {
                toastr.success("weight added successfully");
                populateHistoryView();
            },
            error: function(res) {
                toastr.error(res.responseText);
            }
        });
    });

    function populateHistoryView() {
        Weights.getHistory({
            success: function(history){

                var template = $("#weight-history-item").html();
                var $tbody = $("#weight-card tbody");
                $tbody.html("");

                Mustache.parse(template);

                $.map(history, function(i){
                    var $rendered = $(Mustache.render(template, i));
                    $tbody.append($rendered);
                });

            },
            error: function() {

            }
        })
    }



    populateHistoryView();

}

function initPasswordChangeView() {


    var $form = $("#password-form-card form");

    $form.submit(function(e){
        e.preventDefault();

        var currentpass = $("#passreset-password").val();
        var newpass1 = $("#passreset-new-password1").val();
        var newpass2 = $("#passreset-new-password2").val()

        if (currentpass != User.password) {
            toastr.error("Current password is wrong.");
            return;
        }

        if (newpass1 != newpass2) {
            toastr.error("new passwords don't match");
            return;
        }

        User.changePassword(newpass1, {
            success: function() {
                toastr.success("password changed successfully");
                $form.get(0).reset();
            },
            error: function(res) {
                toastr.error(res.responseText);
            }
        });

    });
}


function activaTab(tab){
  $('.nav-tabs a[href="#' + tab + '"]').tab('show');
};

$(document).ready(function(){
    User.onAuthenticated(function(){
        updateProfileView()
        $("#change-photo").click(function(){
            activaTab("avatar-form-card")
        });

        initProfile();
        initWeightView();
        initPasswordChangeView();
    });
})