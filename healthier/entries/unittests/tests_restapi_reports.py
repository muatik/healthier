import json

import arrow
from django.test import TestCase
from django.test import Client
from django.utils import timezone

from entries.models import Entry, Nutrient


class ReportsAPITestCase(TestCase):

    def setUp(self):
        self.entries = [{
            "category": Entry.CATEGORIES.FOOD_CONSUMPTION,
            "what": "apple",
            "when": timezone.make_aware(arrow.utcnow().replace(days=-3).naive),
            "measure": "skin",
            "quantity": 3,
            "extra": json.dumps({'ndbno': "11362"})  # potato
        }, {
            "category": Entry.CATEGORIES.FOOD_CONSUMPTION,
            "what": "banana",
            "when": timezone.make_aware(arrow.utcnow().replace(hours=-5).naive),
            "measure": "cup, mashed",
            "quantity": 2,
            "extra": json.dumps({'ndbno': "09040"})  # bread
        }, {
            "category": Entry.CATEGORIES.PHYSICAL_ACTIVITY,
            "what": "running",
            "when": timezone.make_aware(arrow.utcnow().replace(hours=-5).naive),
            "measure": "minutes",
            "quantity": 30
        }]

        for i in self.entries:
            Entry.objects.create(**i)

        self.nutrients = [{
            "category": Nutrient.CATEGORIES.INTAKE,
            "entry": Entry.objects.all()[0],
            "label": "Energy",
            "unit": "kcal",
            "quantity": 30.2
        }, {
            "category": Nutrient.CATEGORIES.INTAKE,
            "entry": Entry.objects.all()[1],
            "label": "Energy",
            "unit": "kcal",
            "quantity": 39.8
        }, {
            "category": Nutrient.CATEGORIES.OUTTAKE,
            "entry": Entry.objects.all()[2],
            "label": "Energy",
            "unit": "kcal",
            "quantity": 80.1
        }, {
            "category": Nutrient.CATEGORIES.OUTTAKE,
            "entry": Entry.objects.all()[2],
            "label": "Energy",
            "unit": "kcal",
            "quantity": 79.9
        }, {
            "category": Nutrient.CATEGORIES.INTAKE,
            "entry": Entry.objects.all()[0],
            "label": "Vitamin A",
            "unit": "kcal",
            "quantity": 79.9
        }, {
            "category": Nutrient.CATEGORIES.INTAKE,
            "entry": Entry.objects.all()[2],
            "label": "Vitamin A",
            "unit": "kcal",
            "quantity": 20.1
        }]

        for i in self.nutrients:
            Nutrient.objects.create(**i)

    def test_get_nutrients(self):
        start_date = timezone.make_aware(arrow.utcnow().replace(days=-7).naive)
        end_date = timezone.make_aware(arrow.utcnow().naive)
        c = Client()
        r = c.get("/api/reports/nutrients/",
                  {"start_date": start_date, "end_date": end_date})
        content = r.json()
        self.assertEqual(
            content["data"],
            [
                {'unit': 'kcal', 'value': 70.0, 'label': 'Energy'},
                {'unit': 'kcal', 'value': 100.0, 'label': 'Vitamin A'}])

