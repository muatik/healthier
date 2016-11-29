import json

from django.core.serializers.json import DjangoJSONEncoder
from django.db import models

from entries.fcd import FCD


class JSONField(models.TextField):
    """
    JSONField is a generic textfield that neatly serializes/un-serializes
    JSON objects seamlessly.
    Django snippet #1478

    example:
        class Page(models.Model):
            data = JSONField(blank=True, null=True)


        page = Page.objects.get(pk=5)
        page.data = {'title': 'test', 'type': 3}
        page.save()
    """

    # def from_db_value(self, value, expression, connection, context):
    #     return self.to_python(value)

    def to_python(self, value):
        if value == "":
            return None

        try:
            from django.utils import six
            if isinstance(value, six.string_types):
                return json.loads(value)
        except ValueError:
            pass
        return value

    def get_db_prep_save(self, value, *args, **kwargs):
        if value == "":
            return None
        if isinstance(value, dict):
            value = json.dumps(value, cls=DjangoJSONEncoder)
        return super(JSONField, self).get_db_prep_save(value, *args, **kwargs)


class Entry(models.Model):
    """
    consumption and physical activities are represented as entries.

    they are in a single model to benefit single table inheritance pattern
    """

    CATEGORIES = [
        ("fc", "FOOD_CONSUMPTION"),
        ("rc", "RECIPE_CONSUMPTION"),
        ("a", "PHYSICAL_ACTIVITY")
    ]

    id = models.AutoField(primary_key=True)
    category = models.CharField(choices=CATEGORIES, max_length=1)
    what = models.CharField(max_length=200)
    when = models.DateTimeField()
    quantity = models.IntegerField()
    measure = models.CharField(max_length=50)
    # extra = JSONField(blank=True, default="{}")
    extra = models.TextField(blank=True)

    def insert_nutrients(self, data):
        if Entry.CATEGORIES[0][0] == self.category:
            self.insert_food_nutrients(data)
        elif Entry.CATEGORIES[1][0] == self.category:
            self.insert_recipe_nutrients(data)
        elif Entry.CATEGORIES[2][0] == self.category:
            self.insert_activity_nutrients()
        else:
            raise ValueError("entry type is unknown. {}".format(self.category))

    def insert_food_nutrients(self, data):
        ndbno = data["ndbno"]
        self.extra = json.dumps({"ndbno": ndbno})
        self.save()

        nutrients = FCD.get_nutrients(ndbno=ndbno, measure=self.measure)

        for nutrient_data in nutrients:
            nutrient_data["category"] = Nutrient.CATEGORIES[0][0]  # intake
            Nutrient.insert(self, nutrient_data)

    def insert_recipe_nutrients(self, data):
        recipe_id = data["id"]
        recipe = Recipe.objects.get(id=recipe_id)
        for ingredient in recipe.get_ingredients():
            for nutrient_data in ingredient.get_nutrients():
                Nutrient.insert(self, nutrient_data)

    def insert_activity_nutrients(self):
        nutrient_data = {
            "category": "o",
            "label": "energy burnt",
            "unit": "kcal",
            "quantity": 1.32
        }
        Nutrient.insert(self, nutrient_data)

    @classmethod
    def get_suggestions(cls, keyword):
        history = []
        for i in cls.objects.filter(what__contains=keyword).order_by("-when"):
            if i.category != "fc":
                continue
            history.append({
                "name": i.what,
                "ndbno": json.loads(i.extra).get("ndbno", "")
            })
        return history

    def get_nutrients(self):
        return self.nutrient_set.all()


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

    @classmethod
    def insert(cls, entry, data):
        nutrient = Nutrient(**data)
        nutrient.entry = entry
        nutrient.save()
        return nutrient


class Recipe(models.Model):
    title = models.CharField(max_length=200)
    totalCalorie = models.IntegerField()

    def get_ingredients(self):
        return self.recipeingredient_set.all()

    def increase_calorie(self, quantity):
        self.totalCalorie += quantity

    def decrease_calorie(self, quantity):
        self.totalCalorie -= quantity
        if self.totalCalorie < 0:
            self.totalCalorie = 0


class RecipeIngredient(models.Model):  # each ingredient is a consumption
    recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE)
    what = models.CharField(max_length=255)
    quantity = models.IntegerField()
    measure = models.CharField(max_length=50)
    nutrients = models.TextField(default="{}")  # nutrients stored as json
    ndbno = models.CharField(max_length=100)

    def get_nutrients(self):
        return json.loads(self.nutrients)

    def prepare_nutrients(self):
        nutrients = FCD.get_nutrients(self.ndbno, self.measure)
        self.nutrients = json.dumps(nutrients)

    def get_energy(self):
        return FCD.filter_sum_nutrients(self.get_nutrients(), "Energy", "Kcal")
