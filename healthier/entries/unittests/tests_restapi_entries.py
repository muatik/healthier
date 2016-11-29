import json

import arrow
from django.test import TestCase
from django.test import Client
from django.utils import timezone

from entries.models import Entry


class EntriesTestCase(TestCase):

    def addEntry(self):
        Entry.objects.create(
            category="rc",
            what="apple pie",
            when=timezone.make_aware(arrow.utcnow().replace(hours=-1).naive),
            measure="slice",
            quantity=6,
            extra=json.dumps({"ndbno": 22})
        )

    def test_get(self):
        self.addEntry()
        c = Client()
        r = c.get("/api/entries/")
        content = r.json()
        self.assertEqual(
            set(content[0].keys()),
            set(['when', 'measure', 'id', 'category', 'what', 'quantity']))
        self.assertEqual(len(content), 1)

    def test_post_food_consumption(self):
        c = Client()
        r = c.post("/api/entries/", {
            "category": Entry.CATEGORIES[0][0],
            "what": "apple",
            "when": timezone.make_aware(arrow.utcnow().replace(days=-3).naive),
            "measure": "cup, diced",
            "quantity": 3,
            "extra": json.dumps({'ndbno': 3})
        })
        post_response = r.json()
        get_response = c.get("/api/entries/").json()
        self.assertEqual(len(get_response), 1)
        self.assertEqual(
            set(post_response.keys()),
            set(['when', 'measure', 'id', 'category', 'what', 'quantity']))

    def test_post_activity(self):
        # @TODO
        pass

    def test_post_recipe_consumption(self):
        # @TODO
        pass

    def test_delete(self):
        # @TODO:
        pass

    def test_put(self):
        # @TODO:
        pass
