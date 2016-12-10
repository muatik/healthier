import arrow
from django.test import Client
from django.utils import timezone

from entries.unittests.setup_testcase import SetupTestCase


class ReportsAPITestCase(SetupTestCase):
    def test_get_nutrients(self):
        start_date = timezone.make_aware(arrow.utcnow().replace(days=-7).naive)
        end_date = timezone.make_aware(arrow.utcnow().naive)

        c = self.get_authenticated_client(self.users[0])
        r = c.get("/api/reports/nutrients/",
                  {"start_date": start_date, "end_date": end_date})
        content = r.json()
        self.assertEqual(
            content["data"],
            [
                {'unit': 'kcal', 'value': 70.0, 'label': 'Energy'},
                {'unit': 'kcal', 'value': 100.0, 'label': 'Vitamin A'}])

