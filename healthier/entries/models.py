import json

import arrow
import math
from django.contrib.auth.models import User
from django.core.serializers.json import DjangoJSONEncoder
from django.db import models
from django.db.models import Sum
from django.db.models.functions import TruncDate

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


def create_time_series(start_date, end_date):
    """
    creates a time series sequence taken at successive daily spaced points
    between start_date end end_date

    Args:
        start_date:
        end_date:

    Returns:

    """
    current_date = arrow.get(start_date)
    end_date = arrow.get(end_date)
    data = {}

    while current_date <= end_date:
        data[current_date.date()] = 0
        current_date = current_date.replace(days=1)

    return data


class PhysicalActivity(models.Model):
    code = models.IntegerField()
    METS = models.FloatField()
    name = models.TextField(max_length=255, db_index=True)


class Entry(models.Model):
    """
    consumption and physical activities are represented as entries.

    they are in a single model to benefit single table inheritance pattern
    """
    class CATEGORIES(object):
        FOOD_CONSUMPTION = "fc"
        RECIPE_CONSUMPTION = "rc"
        PHYSICAL_ACTIVITY = "a"

        @classmethod
        def to_set(cls):
            return (
                (cls.FOOD_CONSUMPTION, "food_consumption"),
                (cls.RECIPE_CONSUMPTION, "recipe consumption"),
                (cls.PHYSICAL_ACTIVITY, "physical activity"))

    id = models.AutoField(primary_key=True)
    user = models.ForeignKey(to=User, on_delete=models.CASCADE)
    category = models.CharField(choices=CATEGORIES.to_set(), max_length=1)
    what = models.CharField(max_length=200)
    when = models.DateTimeField()
    quantity = models.IntegerField()
    measure = models.CharField(max_length=50)
    # extra = JSONField(blank=True, default="{}")
    extra = models.TextField(blank=True)
    totalCalorie = models.FloatField(null=True)

    def insert_food_nutrients(self, ndbno):
        nutrients = FCD.get_nutrients(ndbno=ndbno, measure=self.measure)
        for nutrient_data in nutrients:
            nutrient_data["category"] = Nutrient.CATEGORIES.INTAKE  # intake
            nutrient_data["quantity"] *= float(self.quantity)
            Nutrient.insert(self, nutrient_data)

        self.extra = json.dumps({"ndbno": ndbno})
        self.totalCalorie = self.get_total_calorie()
        self.save()

    def insert_recipe_nutrients(self, recipe_id):
        recipe = Recipe.objects.get(id=recipe_id)
        for ingredient in recipe.get_ingredients():
            for nutrient_data in ingredient.get_nutrients():
                nutrient_data["category"] = Nutrient.CATEGORIES.INTAKE  # intake
                nutrient_data["quantity"] *= float(self.quantity)
                Nutrient.insert(self, nutrient_data)

        self.extra = json.dumps({"recipe_id": recipe_id})
        self.totalCalorie = self.get_total_calorie()
        self.save()

    def insert_activity_nutrients(self):
        # MSS_43_8_2011_06_13_AINSWORTH_202093_SDC1.pdf
        # kcal / min = METs x body weight in kilograms / 60
        activity = PhysicalActivity.objects.get(name__exact=self.what)
        latest_weight = UserWeight.get_latest(self.user)
        kcal_min = activity.METS * latest_weight.weight / 60
        self.totalCalorie = math.floor(kcal_min * self.quantity)
        self.save()
        nutrient_data = {
            "category": Nutrient.CATEGORIES.OUTTAKE,
            "label": "Energy",
            "unit": "kcal",
            "quantity": self.totalCalorie
        }
        Nutrient.insert(self, nutrient_data)

    def get_extra(self):
        return json.loads(self.extra)

    def get_nutrients(self):
        return self.nutrient_set.all()

    @classmethod
    def get_suggestions(cls, user, keyword):
        history = []
        query = cls.objects.filter(
            user=user, what__contains=keyword).order_by("-when")
        for i in query:
            if i.category != "fc":
                continue
            history.append({
                "name": i.what,
                "ndbno": json.loads(i.extra).get("ndbno", "")
            })
        return history

    def get_total_calorie(self):
        if self.category == self.CATEGORIES.PHYSICAL_ACTIVITY:
            category = Nutrient.CATEGORIES.OUTTAKE
        else:
            category = Nutrient.CATEGORIES.INTAKE

        record = Nutrient.objects.filter(
            entry=self,
            label="Energy",
            unit="kcal",
            category=category
        ).aggregate(
            Sum("quantity")
        )

        return record["quantity__sum"] if record["quantity__sum"] else 0


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
    class CATEGORIES(object):
        INTAKE = "i"
        OUTTAKE = "o"

        @classmethod
        def to_set(cls):
            return (
                ("i", cls.INTAKE),
                ("o", cls.OUTTAKE))

    id = models.AutoField(primary_key=True)
    category = models.CharField(choices=CATEGORIES.to_set(), max_length=1)
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

    @classmethod
    def get_energy_report(cls, user, category, start_date, end_date):
        """
        returns daily energy report
        Args:
            user: User object
            category: entry category to be grouped by
            start_date: beginning of the date range
            end_date: end of the date range

        Returns: list

        """
        data = create_time_series(start_date, end_date)

        records = cls.objects.filter(
            entry__user=user.id,
            label="Energy",
            unit="kcal",
            category=category,
            entry__when__range=[start_date, end_date]
        ).annotate(
            date=TruncDate("entry__when"),
        ).values(
            "date"
        ).annotate(
            value=Sum('quantity')
        ).values(
            "date", "value", "entry__when"
        )

        for i in records:
            data[i["date"]] = i["value"]

        return sorted(data.items())

    @classmethod
    def get_nutrients_report(cls, user, start_date, end_date):
        nutrients = Nutrient.objects.filter(
            entry__user=user.id,
            category=cls.CATEGORIES.INTAKE,
            entry__when__range=[start_date, end_date]
        ).values(
            "label", "unit"
        ).annotate(
            value=Sum("quantity")
        )
        return nutrients


class Recipe(models.Model):
    user = models.ForeignKey(to=User, on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    totalCalorie = models.IntegerField(default=0)

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


class UserWeight(models.Model):
    user = models.ForeignKey(to=User, on_delete=models.CASCADE)
    date = models.DateField(blank=False)
    weight = models.FloatField()

    @classmethod
    def get_latest(cls, user):
        return cls.objects.filter(user=user).order_by("-date")[0]

class UserProfile(models.Model):
    FEMALE = 0
    MALE = 1
    GENDERS = (
        (FEMALE, "female"),
        (MALE, "male"),
    )

    user = models.OneToOneField(to=User, on_delete=models.CASCADE)
    gender = models.SmallIntegerField(choices=GENDERS)
    height = models.SmallIntegerField(blank=False)
    birth_date = models.DateField(blank=False)

