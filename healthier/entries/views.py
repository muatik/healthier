import json

from django.db.models import Sum
from rest_framework.generics import DestroyAPIView, ListCreateAPIView, \
    ListAPIView
from rest_framework.response import Response
from rest_framework.views import APIView

from entries.consumption import insert_nutrients, calculate_consumption
from entries.fcd import FCD
from entries.models import Entry, Nutrient, Recipe, RecipeIngredient
from entries.serializers import EntrySerializer, NutrientSerializer, \
    RecipeSerializer, RecipeIngredientSerializer


class EntryView(ListCreateAPIView):
    queryset = Entry.objects.all()
    serializer_class = EntrySerializer

    def perform_create(self, serializer):
        entry = serializer.save()
        insert_nutrients(entry, serializer.initial_data)


class NutrientsView(ListAPIView):
    serializer_class = NutrientSerializer

    def get_queryset(self):
        entry_id = self.kwargs["entry_id"]
        return Nutrient.objects.filter(entry=entry_id)


class FoodSuggestionView(APIView):
    def get(self, request, format=None):
        keyword = request.query_params.get("q").strip()

        history = Entry.objects.filter(what__contains=keyword)
        history = [{"name": i.what, "ndbno": i.extra["ndbno"]}
                   for i in history]

        # recipes = Recipe.objects.filter(title__contains=keyword)
        # recipes = [RecipeSerializer(i).data for i in recipes]
        try:
            foods = FCD.find(keyword)
        except KeyError:
            foods = []

        return Response(history + foods)
        # return Response(foods)


class FoodReport(APIView):
    def get(self, request, ndbno, format=None):
        result = FCD.get_measures(ndbno)
        return Response(result)


class ActivitySuggestionView(APIView):
    def get(self, request, format=None):
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
    def get(self, request, format=None):

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


class Reports2(APIView):
    def get(self, request, format=None):
        pass


class RecipesView(ListCreateAPIView, DestroyAPIView):
    serializer_class = RecipeSerializer
    queryset = Recipe.objects.all()


# TODO: move this function into an appropriate module
def sum_quantity(nutrients, label, unit):
    label = label.lower()
    unit = unit.lower()
    return sum(n["quantity"] for n in nutrients
               if n["label"].lower() == label and n["unit"].lower() == unit)


class RecipeIngredientsView(ListCreateAPIView, DestroyAPIView):
    serializer_class = RecipeIngredientSerializer
    queryset = RecipeIngredient.objects.all()

    def perform_create(self, serializer):
        recipe_id = self.kwargs["recipe_id"]

        ndbno = serializer.initial_data["ndbno"]
        measure = serializer.validated_data["measure"]
        quantity = serializer.validated_data["quantity"]
        nutrients = calculate_consumption(ndbno, measure, quantity)
        serializer.save(recipe_id=recipe_id, nutrients=nutrients)

        recipe = Recipe.objects.get(id=recipe_id)
        energy_intake = sum_quantity(nutrients, "energy", "kcal") * quantity
        recipe.increase_calorie(energy_intake)
        recipe.save()

    def perform_destroy(self, ingredient):
        energy = sum_quantity(ingredient.getNutrients(), "energy", "kcal")
        ingredient.recipe.decrease_calorie(energy * ingredient.quantity)
        ingredient.recipe.save()
        super().perform_destroy(ingredient)




