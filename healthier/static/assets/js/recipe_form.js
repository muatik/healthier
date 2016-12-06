var RecipeForm = (function($container, recipe_id){
    var $container = $($container);
    var $ingredients = $("#ingredients");
    var $id = $("input[name='id']", $container);
    var $title = $("input[name='title']", $container);
    var data; // holds recipe entity data.

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

    function is_recipe_submitted() {
        return $id.val() != "";
    }

    function submit_recipe(options) {
        console.log("submitting the recipe");

        if (data)
            var totalEnergy = calcTotalEnergy(data.ingredients);
        else
            var totalEnergy = 0;

        $.ajax({
            url: (is_recipe_submitted() ? '/api/recipes/' + $id.val() + "/" : '/api/recipes/') ,
            type: (is_recipe_submitted() ? "PUT" : "POST"),
            data: {
                "id": $id.val(),
                "title": $title.val(),
                "totalCalorie": totalEnergy
            },
            error: function() {
                if (options.onError)
                    options.onError();
                toastr.error("recipe could not be saved :(")
            },
            success: function(res) {
                if (!data)
                    data = res;
                $id.val(res.id);
                toastr.info("recipe has been saved.");
                if (options.onSuccess)
                    options.onSuccess();
            }
        });
    }


    function submit_ingredient(ndbno, what, measure, amount, options) {
        console.log("submitting ingredient: " + what);

        if (!is_recipe_submitted()) {
            submit_recipe({"onSuccess": function(){
                submit_ingredient(ndbno, what, measure, amount, options)
            }});
            return;
        }

        console.log("ready to submit ingredient: " + what);
        $.ajax({
            url: '/api/recipes/' + $id.val()+ '/ingredients/',
            type: 'POST',
            data: {
                "what": what,
                "measure": measure,
                "quantity": amount,
                "ndbno": ndbno
            },
            error: function() {
                if (options.onError)
                    options.onError();
                toastr.error("ingredient could not be saved :(")
            },
            success: function(res) {
                if (!data.ingredients)
                    data.ingredients = [];
                data.ingredients.push(res);
                toastr.info("ingredient has been saved.");
                if (options.onSuccess)
                    options.onSuccess(res);
            }
        });
    }

    function prepend_entry(data, animation) {
        var template = $("#template_menu_entry").html();
        Mustache.parse(template);

        var $rendered = $(Mustache.render(template, data));

        // $(".btn-save", $rendered).click(function(){
        //     submit_ingredient(
        //         $ndbno.val(), $what.val(), $measures.val(), $amount.val()
        //     )
        // });

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



    /**
    fetch measures associated ndbno and fill the measures with them
    */
    function update_measures($measures, ndbno) {
        showLoader($measures.parent());
        $.ajax({
            url: '/api/food/' + ndbno + '/measures/',
            type: 'GET',
            error: function() {
                hideLoader($measures.parent());
                toastr.error("units could not be fetched :(")
            },
            success: function(res) {
                hideLoader($measures.parent());
                $measures.html("");
                $.map(res, function(item){
                    $measures.append("<option>" + item + "</option>");
                });
            }
        });
    }

    function delete_ingredient(ingredient, options) {
        console.log("deleting ingredient: " + ingredient.what);
        $.ajax({
            url: '/api/recipes/' + $id.val()+ '/ingredients/' + ingredient.id,
            type: 'DELETE',
            error: function() {
                if (options && options.onError)
                    options.onError();
                toastr.error("ingredient could not be deleted :(")
            },
            success: function(res) {

                for (var i = data.ingredients.length - 1; i >= 0; i--) {
                    if (data.ingredients[i].id == ingredient.id) {
                        data.ingredients.splice(i, 1);
                        break;
                    }
                };

                toastr.info("ingredient has been deleted.");
                if (options && options.onSuccess)
                    options.onSuccess(res);
                updateTotalBar();
            }
        });
    }

    /* *
    initialize ingredient form by mostly binding elements
    */
    function init_ingredient_form(form) {
        var $form = $(form);
        var $what = $(".what", $form);
        var $ndbno = $(".ndbno", $form);
        var $measures = $(".measures", $form);
        var $amount = $("input[name='amount']", $form);
        var $submitButton = $(".btn-save", $form);

        $(".btn-delete", $form).click(function(){
            $form.remove();
        });

        $submitButton.click(function(){

            if ($ndbno.val() == "" || 0 === $what.val().length || 0 === $amount.val().length) {
                console.log("ingredient form is not valid");
                return;
            }

            showLoader($form);
            submit_ingredient($ndbno.val(), $what.val(), $measures.val(), $amount.val(), {
                "onCancelled": function (e) {
                    hideLoader($form);
                },
                "onSuccess": function (ingredient) {
                    switch_to_igredient_view_mode($form, ingredient);
                    updateTotalBar();
                }
            });
        });

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
                update_measures($measures, suggestion.data)
            }
        });
    }

    function calcEnergy(ingredient) {
        for (var i = ingredient.nutrients.length - 1; i >= 0; i--) {
            var n = ingredient.nutrients[i];
            if (n.label.toLowerCase() == "energy" && n.unit.toLowerCase() =="kcal")
                return n.quantity;

        };
    }

    function calcTotalEnergy(ingredients) {
        var totalKCal = 0;
        $.map(ingredients, function(ingredient) {
            totalKCal += calcEnergy(ingredient);
        });
        return totalKCal;
    }

    function showLoader($container) {
        materialadmin.AppCard.addCardLoader($container);
    }

    function hideLoader($container) {
        materialadmin.AppCard.removeCardLoader($container);
    }

    function updateTotalBar() {
        $("#total-bar").remove();

        if (data.ingredients.length < 2)
            return;

        var barData = {
            "totalEnergy": function() {
                var totalKCal = calcTotalEnergy(data.ingredients);
                return totalKCal + " Kcal";
            },
            "totalNutrients": function() {
                var nutrients = {};
                $.map(data.ingredients, function(ingredient) {
                    $.map(ingredient.nutrients, function(nutrient) {
                        if (!nutrients[nutrient.label])
                            nutrients[nutrient.label] = {
                                "label": nutrient.label,
                                "quantity": 0
                            }
                        nutrients[nutrient.label].quantity += nutrient.quantity;
                    });
                });
                return nutrients;
            }
        }

        var template = $("#template_menu_total").html();
        Mustache.parse(template);
        var $rendered = $(Mustache.render(template, barData));

        $(".btn-nutrients", $rendered).click(function() {
            $(".nutrients-list", $rendered).toggle();
        });

        $ingredients.append($rendered);
    }

    function render_ingredient_form() {
        var template = $("#template_ingredient_form").html();
        Mustache.parse(template);
        var $rendered = $(Mustache.render(template, {}));
        init_ingredient_form($rendered);
        if ($("#total-bar").length > 0) {
            $rendered.insertBefore($("#total-bar"));
        } else {
            $ingredients.append($rendered);
        }
    }

    /* *
    returns rendering of the read-only view mode when it become persistent
    */
    function render_ingredient_view(ingredient) {
        var template = $("#template_menu_entry").html();
        Mustache.parse(template);

        ingredient.formattedQuantity = function() {
            return this.quantity.toFixed(3);
        }

        ingredient.energyIntage = function() {
            return calcEnergy(this) + " Kcal";
        }

        var $rendered = $(Mustache.render(template, ingredient));

        $(".btn-delete", $rendered).click(function(e){
            e.preventDefault();
            delete_ingredient(ingredient);
            $rendered.remove();
        });

        $(".btn-nutrients", $rendered).click(function() {
            $(".nutrients-list", $rendered).toggle();
        });

        return $rendered
    }

    function switch_to_igredient_view_mode($form, ingredient) {
        $form.replaceWith(render_ingredient_view(ingredient));
    }

    // render recipe entity to the html view.
    function render() {
        $title.val(data.title);
        $.map(data.ingredients, function(ingredient){
            var rendered = render_ingredient_view(ingredient);
            $ingredients.append(rendered);
        });
        updateTotalBar();
    }

    function fetch_ingredients() {
        $.ajax({
            url: '/api/recipes/' + data.id + "/ingredients/",
            type: 'GET',
            error: function() {
                toastr.error("recipe could not be fetched :(")
            },
            success: function(ingredients) {
                data.ingredients = ingredients;
                render();
            }
        });
    }

    function fetch_recipe() {
        $.ajax({
            url: '/api/recipes/',
            type: 'GET',
            error: function() {
                toastr.error("recipe could not be fetched :(")
            },
            success: function(recipes) {

                for (var i = recipes.length - 1; i >= 0; i--) {
                    if (recipes[i].id == $id.val()) {
                        res = recipes[i];
                        break;
                    }
                };

                data = res;
                $id.val(res.id);
                fetch_ingredients();

            }
        });
    }

    function init() {
        if (recipe_id) {
            $id.val(recipe_id)
        }

        $(".btn-submit", $container).click(submit_recipe);
        $(".add-ingredient").click(render_ingredient_form);
        if ($id.val() !== "")
            fetch_recipe()
    }

    init();
});

$(document).ready(function(){

    function getParameterByName(name, url) {
        if (!url) {
          url = window.location.href;
        }
        name = name.replace(/[\[\]]/g, "\\$&");
        var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
            results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, " "));
    }

    t = RecipeForm($("#recipe-form"), getParameterByName("id"));
});


