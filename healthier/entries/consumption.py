import json

from entries.fcd import FCD
from entries.models import Nutrient, Recipe


def calculate_consumption(ndbno, measure, quantity):
    nutrients = FCD.get_nutrients(ndbno)
    intake = []
    for nutrient in nutrients:
        for i_measure in nutrient["measures"]:
            if i_measure["label"] == measure and i_measure["value"] != 0:
                intake.append({
                        "category": "i",
                        "label": nutrient["name"],
                        "unit": nutrient["unit"],
                        "quantity": float(i_measure["value"]) * quantity
                    })
    return intake


def insert_food_consumption(entry, data):
    entry.extra = {"ndbno": data["ndbno"]}
    entry.extra = json.dumps({"ndbno": data["ndbno"]})
    entry.save()
    nutrients = calculate_consumption(
        data["ndbno"], entry.measure, entry.quantity)

    for nutrient_data in nutrients:
        try:
            nutrient = Nutrient(**nutrient_data)
            nutrient.entry = entry
            nutrient.save()
        except Exception as e:
            pass


def insert_recipe(entry, data):
    recipe = Recipe.objects.get(id=data["id"])
    for ingredient in recipe.recipeingredient_set.all():
        for n in ingredient.getNutrients():
            nutrient = Nutrient(**n)
            nutrient.quantity = nutrient.quantity * entry.quantity
            nutrient.entry = entry
            nutrient.save()


def insert_nutrients(entry, data):
    if data["category"] == "c" and "ndbno" not in data and "id" in data:
        insert_recipe(entry, data)
    elif data["category"] == "c" and "ndbno" in data:
        insert_food_consumption(entry, data)
    else:
        nutrient = Nutrient(**{
            "category": "o",
            "label": "energy burnt",
            "unit": "kcal",
            "quantity": float(entry.quantity) * 1.32
        })
        nutrient.entry = entry
        nutrient.save()


