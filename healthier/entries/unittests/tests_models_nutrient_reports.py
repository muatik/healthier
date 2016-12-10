import json

import arrow
from django.db.models import QuerySet
from django.test import TestCase
from django.utils import timezone

from entries.models import Entry, Nutrient
from entries.unittests.setup_testcase import SetupTestCase


class NutrientModelReportTestCase(SetupTestCase):

    def test_nutrients_report(self):
        start_date = timezone.make_aware(arrow.utcnow().replace(days=-7).naive)
        end_date = timezone.make_aware(arrow.utcnow().naive)
        report = Nutrient.get_nutrients_report(
            self.users[0],
            start_date=start_date, end_date=end_date)

        report = dict([i["label"], i] for i in report)
        self.assertIn("Vitamin A", report)
        self.assertEqual(
            {'unit': 'kcal', 'label': 'Vitamin A', 'value': 100.0},
            report["Vitamin A"])

    def test_total_energy_intake(self):
        start_date = arrow.utcnow().replace(days=-10)
        end_date = arrow.utcnow()

        report = Nutrient.get_energy_report(
            self.users[0],
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
            self.users[0],
            Nutrient.CATEGORIES.OUTTAKE,
            timezone.make_aware(start_date.naive),
            timezone.make_aware(end_date.naive))

        self.assertEqual(dict(report)[self.entries[2]["when"].date()], 160)