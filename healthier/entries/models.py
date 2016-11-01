import json

from django.core.serializers.json import DjangoJSONEncoder
from django.db import models


class JSONField(models.TextField):
    """
    JSONField is a generic textfield that neatly serializes/unserializes
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
    CATEGORIES = [
        ("c", "CONSUMPTION"),
        ("a", "ACTIVITY")
    ]
    id = models.AutoField(primary_key=True)
    category = models.CharField(choices=CATEGORIES, max_length=1)
    what = models.CharField(max_length=200)
    when = models.DateTimeField()
    quantity = models.IntegerField()
    measure = models.CharField(max_length=50)
    # extra = JSONField(blank=True, default="{}")
    extra = models.TextField(blank=True)


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
