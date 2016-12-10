import base64
import json

import arrow
from django.test import Client
from django.utils import timezone

from entries.models import Entry
from entries.unittests.setup_testcase import SetupTestCase


class EntriesTestCase(SetupTestCase):
    def test_NotAuthenticatedException(self):
        c = Client()
        r = c.get("/api/entries/")
        content = r.json()
        self.assertEqual(r.status_code, 403)

    def test_get(self):
        c = self.get_authenticated_client(self.users[0])
        r = c.get("/api/entries/")
        content = r.json()

        self.assertEqual(
            set(content[0].keys()),
            set([
                'when', 'measure', 'id',
                'category', 'what', 'quantity', "extra"]))

        # each user has its own response
        self.assertEqual(len(content), 3)
        c2 = self.get_authenticated_client(self.users[1])
        get_response = c2.get("/api/entries/").json()
        self.assertEqual(len(get_response), 1)

    def test_post_food_consumption(self):
        c = self.get_authenticated_client(self.users[0])
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

        c = self.get_authenticated_client(self.users[0])
        response = c.post("/api/entries/", activity_data).json()

        get_response = c.get("/api/entries/").json()
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
        c = self.get_authenticated_client(self.users[0])
        entries = c.get("/api/entries/").json()
        self.assertEqual(len(entries), 3)

        entry_id = entries[0]["id"]
        response = c.delete("/api/entries/{}/".format(entry_id))
        entry = c.get("/api/entries/{}".format(entry_id))
        self.assertEqual(entry.status_code, 404)
