import json

from django.db import models


class Entry(models.Model):
    CATEGORIES = [
        ("c", "CONSUMPTION"),
        ("a", "ACTIVITY")
    ]
    id = models.AutoField(primary_key=True)
    category = models.CharField(choices=CATEGORIES, max_length=1)
    what = models.CharField(max_length=100)
    when = models.DateTimeField()
    quantity = models.IntegerField()
    measure = models.CharField(max_length=50)


class Nutrient(models.Model):
    """
    example object:
    {
        'category': 'intake',
        'quantity': 0.68,
        'label': 'Glucose (dextrose)',
        'unit': 'g'
    }
    """
    CATEGORIES = [
        ("i", "INTAKE"),
        ("o", "OUTTAKE")
    ]
    id = models.AutoField(primary_key=True)
    category = models.CharField(choices=CATEGORIES, max_length=1)
    entry = models.ForeignKey(Entry, on_delete=models.CASCADE)
    label = models.CharField(max_length=100)
    unit = models.CharField(max_length=20)
    quantity = models.FloatField()


class Recipe(models.Model):
    title = models.CharField(max_length=200)
    totalCalorie = models.IntegerField()

    def increase_calorie(self, quantity):
        self.totalCalorie += quantity

    def decrease_calorie(self, quantity):
        self.totalCalorie -= quantity
        if self.totalCalorie < 0:
            self.totalCalorie = 0


class RecipeIngredient(models.Model):  # each ingredient is a consumption
    recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE)
    what = models.CharField(max_length=100)
    quantity = models.IntegerField()
    measure = models.CharField(max_length=50)
    nutrients = models.TextField(default="{}")  # nutrients stored as json

    def getNutrients(self):
        return json.loads(self.nutrients)
