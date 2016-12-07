import json

import arrow
from django.test import TestCase
from django.utils import timezone

from entries.models import Entry, Nutrient


class NutrientModelTestCase(TestCase):

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
            "when": timezone.make_aware(arrow.utcnow().replace(hours=-3).naive),
            "measure": "cup, mashed",
            "quantity": 2,
            "extra": json.dumps({'ndbno': "09040"})  # bread
        }, {
            "category": Entry.CATEGORIES.PHYSICAL_ACTIVITY,
            "what": "running",
            "when": timezone.make_aware(arrow.utcnow().replace(hours=-3).naive),
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
        }]

        for i in self.nutrients:
            Nutrient.objects.create(**i)

    def test_energy_report_time_series(self):
        start_date = arrow.utcnow().replace(days=-10)
        end_date = arrow.utcnow()

        report = Nutrient.get_energy_report(
            Nutrient.CATEGORIES.INTAKE,
            timezone.make_aware(start_date.naive),
            timezone.make_aware(end_date.naive))

        days_count = (end_date - start_date).days + 1
        self.assertEqual(len(report), days_count)

        first_date = start_date.date()
        last_date = end_date.date()
        self.assertIn(first_date, dict(report))
        self.assertIn(last_date, dict(report))

    def test_total_energy_intake(self):
        start_date = arrow.utcnow().replace(days=-10)
        end_date = arrow.utcnow()

        report = Nutrient.get_energy_report(
            Nutrient.CATEGORIES.INTAKE,
            timezone.make_aware(start_date.naive),
            timezone.make_aware(end_date.naive))

        self.assertEqual(
            dict(report)[self.nutrients[1]["entry"].when.date()],
            self.nutrients[1]["quantity"])

    def test_total_energy_outtake(self):
        start_date = arrow.utcnow().replace(days=-10)
        end_date = arrow.utcnow()

        report = Nutrient.get_energy_report(
            Nutrient.CATEGORIES.OUTTAKE,
            timezone.make_aware(start_date.naive),
            timezone.make_aware(end_date.naive))

        self.assertEqual(dict(report)[self.entries[2]["when"].date()], 160)
