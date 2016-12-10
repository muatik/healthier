import json
from datetime import datetime

import arrow
from django.contrib.auth.models import User
from django.test import TestCase
from django.utils import timezone

from entries.models import Entry, Nutrient, UserProfile
from entries.unittests.setup_testcase import SetupTestCase


class NutrientModelTestCase(SetupTestCase):

    def test_energy_report_time_series(self):
        start_date = arrow.utcnow().replace(days=-10)
        end_date = arrow.utcnow()

        report = Nutrient.get_energy_report(
            self.users[0],
            Nutrient.CATEGORIES.INTAKE,
            timezone.make_aware(start_date.naive),
            timezone.make_aware(end_date.naive))

        days_count = (end_date - start_date).days + 1
        self.assertEqual(len(report), days_count)

        first_date = start_date.date()
        last_date = end_date.date()
        self.assertIn(first_date, dict(report))
        self.assertIn(last_date, dict(report))


