var FoodMenuForm = (function(){
    var $ingredients = $("#ingredients");

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

    function submit_ingredient(ndbno, what, measure, amount) {

    }

    function prepend_entry(data, animation) {
        var template = $("#template_menu_entry").html();
        Mustache.parse(template);

        var $rendered = $(Mustache.render(template, data));

        $(".btn-save", $rendered).click(function(){
            submit_ingredient(
                $ndbno.val(), $what.val(), $measures.val(), $amount.val()
            )
        });

        $(".btn-delete", $rendered).click(function(){
            if (window.confirm("are you sure?") == true) {
                delete_entry(data.id, {});
                $rendered.remove();
            }
        });

        if (animation)
            $rendered.hide();
        $timeline.prepend($rendered);
        if (animation)
            $rendered.toggle("fold")
    }

    function init_ingredient_form(form) {
        $form = $(form);
        $what = $(".what", $form);
        $ndbno = $(".ndbno", $form);
        $measures = $(".measures", $form);

        function update_measures(ndbno) {

            $.ajax({
                url: '/api/food/' + ndbno + '/measures/',
                type: 'GET',
                error: funct™ion() {
                    toastr.error("units could not be fetched :(")
                },
                success: function(res) {
                    $measures.html("");
                    $.map(res, function(item){
                        $measures.append("<option>" + item + "</option>");
                    });
                }
            });
        }

        $what.autocomplete({
            lookup: function(query, done) {
                $.ajax({
                    url: '/api/food/',
                    type: 'GET',
                    data: {
                        q: query,
                    },
                    success: function(res) {
                        var suggestions = $.map(res, function(item){
                            return {value: item.name, data: item.ndbno}
                        });
                        var result = {"suggestions": suggestions};
                        done(result);
                    }
                });
            },
            onSelect: function (suggestion) {
                $ndbno.val(suggestion.data)
                update_measures(suggestion.data)
            }
        });
    }

    function insert_ingredient_form() {
        var template = $("#template_ingredient_form").html();
        Mustache.parse(template);
        var $rendered = $(Mustache.render(template, {}));
        init_ingredient_form($rendered);
        $ingredients.append($rendered);
    }

    function init() {
        $(".add-ingredient").click(insert_ingredient_form);
    }

    init();
});

$(document).ready(function(){
    t = FoodMenuForm();
});


