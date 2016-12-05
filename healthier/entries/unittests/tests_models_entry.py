import json

import arrow
from django.test import TestCase
from django.utils import timezone
from entries.models import Entry


class EntryModelTestCase(TestCase):
    def setUp(self):
        self.entries = [{
            "category": Entry.CATEGORIES.FOOD_CONSUMPTION,
            "what": "apple",
            "when": timezone.make_aware(arrow.utcnow().replace(days=-3).naive),
            "measure": "cup, diced",
            "quantity": 3,
            "extra": json.dumps({'ndbno': "18081"})
        }, {
            "category": Entry.CATEGORIES.FOOD_CONSUMPTION,
            "what": "banana",
            "when": timezone.make_aware(arrow.utcnow().replace(hours=-3).naive),
            "measure": "skin",
            "quantity": 2,
            "extra": json.dumps({'ndbno': "11362"})
        }]
        for i in self.entries:
            Entry.objects.create(**i)

    def test_entry_fields(self):
        consumption = Entry.objects.get(what="apple")
        self.assertEqual(consumption.what, self.entries[0]["what"])
        self.assertEqual(consumption.category, self.entries[0]["category"])
        self.assertEqual(consumption.measure, self.entries[0]["measure"])
        self.assertEqual(consumption.quantity, self.entries[0]["quantity"])

    def test_entry_suggestion(self):
        suggestions = Entry.get_suggestions(keyword="apple")
        self.assertEqual(len(suggestions), 1)

        Entry.objects.create(
            category="fc",
            what="apple pie",
            when=timezone.make_aware(arrow.utcnow().replace(hours=-1).naive),
            measure="skin",
            quantity=6,
            extra=json.dumps({"ndbno": "11362"})
        )
        suggestions = Entry.get_suggestions(keyword="apple")
        self.assertEqual(len(suggestions), 2)

    def test_entry_suggestion_order(self):
        Entry.objects.create(
            category="fc",
            what="apple pie",
            when=timezone.make_aware(arrow.utcnow().naive),
            measure="slice",
            quantity=6,
            extra=json.dumps({"ndbno": 22})
        )
        Entry.objects.create(
            category="fc",
            what="old apple pie",
            when=timezone.make_aware(arrow.utcnow().replace(days=-10).naive),
            measure="slice",
            quantity=6,
            extra=json.dumps({"ndbno": 22})
        )

        suggestions = Entry.get_suggestions(keyword="apple")
        self.assertEqual(len(suggestions), 3)
        self.assertEqual(suggestions[0]["name"], "apple pie")
        self.assertEqual(suggestions[2]["name"], "old apple pie")

