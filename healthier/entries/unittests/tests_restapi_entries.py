import json

import arrow
from django.test import TestCase
from django.test import Client
from django.utils import timezone

from entries.models import Entry


class EntriesTestCase(TestCase):

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

    def test_get(self):
        c = Client()
        r = c.get("/api/entries/")
        content = r.json()
        self.assertEqual(
            set(content[0].keys()),
            set([
                'when', 'measure', 'id',
                'category', 'what', 'quantity', "extra"]))
        self.assertEqual(len(content), 3)

    def test_post_food_consumption(self):
        c = Client()
        r = c.post("/api/entries/", {
            "category": Entry.CATEGORIES.FOOD_CONSUMPTION,
            "what": "apple",
            "when": timezone.make_aware(arrow.utcnow().replace(days=-3).naive),
            "measure": "cup, diced",
            "quantity": 3,
            "extra": json.dumps({'ndbno': "09326"})  # watermelon
        })
        post_response = r.json()
        get_response = c.get("/api/entries/").json()
        self.assertEqual(len(get_response), 4)
        self.assertEqual(
            set(post_response.keys()),
            set([
                'when', 'measure', 'id',
                'category', 'what', 'quantity', "extra"]))

    def test_post_activity(self):
        activity_data = {
            "category": Entry.CATEGORIES.PHYSICAL_ACTIVITY,
            "what": "running",
            "when": arrow.utcnow().replace(days=-3).naive,
            "measure": "minutes",
            "quantity": 3,
            "extra": json.dumps({})
        }
        response = Client().post("/api/entries/", activity_data).json()

        get_response = Client().get("/api/entries/").json()
        self.assertEqual(len(get_response), 4)

        self.assertEqual(
            set(response.keys()),
            set([
                'when', 'measure', 'id',
                'category', 'what', 'quantity', "extra"]))

        activity_data["when"] = arrow.get(activity_data["when"])
        response["when"] = arrow.get(response["when"])

        for k, v in activity_data.items():
            self.assertEqual(
                response[k], v,
                "physical activity data {} is not equal".format(k))

        self.assertEqual(
            response["category"], Entry.CATEGORIES.PHYSICAL_ACTIVITY)

    def test_delete(self):
        entries = Client().get("/api/entries/").json()
        self.assertEqual(len(entries), 3)

        entry_id = entries[0]["id"]
        response = Client().delete("/api/entries/{}/".format(entry_id))
        entry = Client().get("/api/entries/{}".format(entry_id))
        self.assertEqual(entry.status_code, 404)
