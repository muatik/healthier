var FoodMenus = (function(){
    var $container = $("#food-menus");

    function fetch_entries(callback) {
        $.ajax({
            url: '/api/recipes/',
            type: 'GET',
            error: callback.onError,
            success: callback.onSuccess,
        });
    }

    function delete_entry(entryId, callback) {
        $.ajax({
            url: '/api/recipes/' + entryId + '/',
            type: 'DELETE',
            error: callback.onError,
            success: callback.onSuccess,
        });
    }

    function prepend_entry(data, animation) {
        var template = $("#template_menu_entry").html();
        Mustache.parse(template);

        var $rendered = $(Mustache.render(template, data));

        $(".btn-delete", $rendered).click(function(){
            if (window.confirm("are you sure?") == true) {
                delete_entry(data.id, {});
                $rendered.remove();
            }
        });

        if (animation)
            $rendered.hide();
        $container.prepend($rendered);
        if (animation)
            $rendered.toggle("fold")
    }


    function init() {
        fetch_entries({
            onSuccess: function(res) {
                $.map(res, function(entry){prepend_entry(entry, false)})
                $('[data-toggle="tooltip"]').tooltip({container: 'body'});
            },
            onError: function() {
                toastr.error("food menus could not be fetched :(")
            }
        })

    }
    init();
});

$(document).ready(function(){
    t = FoodMenus();
    $('[data-toggle="tooltip"]').tooltip({container: 'body'});
});


