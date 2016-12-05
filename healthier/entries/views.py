import json

from django.db.models import Sum
from rest_framework.generics import ListCreateAPIView, \
    ListAPIView, RetrieveUpdateDestroyAPIView, DestroyAPIView
from rest_framework.response import Response
from rest_framework.views import APIView

from entries.fcd import FCD
from entries.models import Entry, Nutrient, Recipe, RecipeIngredient
from entries.serializers import EntrySerializer, NutrientSerializer, \
    RecipeIngredientSerializer, RecipeSerializer


class EntryView(ListCreateAPIView):
    queryset = Entry.objects.all().order_by("-when")
    serializer_class = EntrySerializer

    def perform_create(self, serializer):
        entry = serializer.save()
        data = serializer.initial_data
        data["extra"] = json.loads(data["extra"])

        if Entry.CATEGORIES.FOOD_CONSUMPTION == entry.category:
            entry.insert_food_nutrients(data["extra"]["ndbno"])
        elif Entry.CATEGORIES.RECIPE_CONSUMPTION == entry.category:
            entry.insert_recipe_nutrients(data)
        elif Entry.CATEGORIES.PHYSICAL_ACTIVITY == entry.category:
            entry.insert_activity_nutrients()
        else:
            raise ValueError("entry type is unknown. {}".format(entry.category))


class NutrientsView(ListAPIView):
    serializer_class = NutrientSerializer

    def get_queryset(self):
        entry_id = self.kwargs["entry_id"]
        return Nutrient.objects.filter(entry=entry_id)


class FoodSuggestionView(APIView):
    def get(self, request, frm=None):
        keyword = request.query_params.get("q").strip()

        history = []
        for i in Entry.objects.filter(what__contains=keyword):
            if not i.extra:
                continue

            history.append({
                "name": i.what,
                "ndbno": json.loads(i.extra).get("ndbno", "")
            })

        recipes = Recipe.objects.filter(title__contains=keyword)
        recipes = [{"name": i.title, "id": i.id, "type": "recipe"}
                   for i in recipes]

        try:
            foods = FCD.find(keyword)
        except KeyError:
            foods = []

        return Response(recipes + history + foods)
        # return Response(foods)


class FoodReport(APIView):
    def get(self, request, ndbno, frm=None):
        result = FCD.get_measures(ndbno)
        return Response(result)


class ActivitySuggestionView(APIView):
    def get(self, request, frm=None):
        return Response([
            {"id": 1, "name": "ARNOLD DUMBBELL PRESS"},
            {"id": 2, "name": "Hill sprint"},
            {"id": 3, "name": "jump rope"},
            {"id": 4, "name": "Long Jumps"},
            {"id": 5, "name": "Pushups"},
            {"id": 6, "name": "Bicycle Crunches"},
            {"id": 7, "name": "Mountain Climbers"},
            {"id": 8, "name": "Trail running"},
        ])


class Reports(APIView):
    def get(self, request, frm=None):
        outtake = Nutrient.objects.filter(
            category="o"
        ).aggregate(Sum("quantity"))

        intake = Nutrient.objects.filter(
            category="i", label="Energy", unit="kcal"
        ).aggregate(Sum("quantity"))

        return Response({
            "energy": {
                "intake": intake["quantity__sum"],
                "outtake": outtake["quantity__sum"]
            }
        })


class RecipesView(ListCreateAPIView):
    serializer_class = RecipeSerializer
    queryset = Recipe.objects.all()


class RecipeView(RetrieveUpdateDestroyAPIView):
    serializer_class = RecipeSerializer
    queryset = Recipe.objects.all()


class RecipeIngredientsView(ListCreateAPIView, DestroyAPIView):
    serializer_class = RecipeIngredientSerializer
    queryset = RecipeIngredient.objects.all()

    def get_queryset(self):
        recipe_id = self.kwargs["recipe_id"]
        return RecipeIngredient.objects.filter(recipe_id=recipe_id)

    def perform_create(self, serializer):
        recipe_id = self.kwargs["recipe_id"]
        recipe = Recipe.objects.get(id=recipe_id)

        ingredient = serializer.save(recipe_id=recipe_id)
        ingredient.prepare_nutrients()
        ingredient.save()

        recipe.increase_calorie(ingredient.get_energy())
        recipe.save()

    def perform_destroy(self, ingredient):
        ingredient.recipe.decrease_calorie(ingredient.get_energy())
        ingredient.recipe.save()
        super().perform_destroy(ingredient)


