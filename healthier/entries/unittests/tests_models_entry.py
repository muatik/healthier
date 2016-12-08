import json
from datetime import datetime

import arrow
from django.contrib.auth.models import User
from django.test import TestCase
from django.utils import timezone
from entries.models import Entry, UserProfile
from entries.unittests.setup_testcase import SetupTestCase


class EntryModelTestCase(SetupTestCase):

    def test_entry_fields(self):
        consumption = Entry.objects.get(what="apple")
        self.assertEqual(consumption.what, self.entries[0]["what"])
        self.assertEqual(consumption.category, self.entries[0]["category"])
        self.assertEqual(consumption.measure, self.entries[0]["measure"])
        self.assertEqual(consumption.quantity, self.entries[0]["quantity"])

    def test_entry_suggestion(self):
        suggestions = Entry.get_suggestions(self.users[0], keyword="apple")
        self.assertEqual(len(suggestions), 1)

        Entry.objects.create(
            user=self.users[0],
            category="fc",
            what="apple pie",
            when=timezone.make_aware(arrow.utcnow().replace(hours=-1).naive),
            measure="skin",
            quantity=6,
            extra=json.dumps({"ndbno": "11362"})
        )

        Entry.objects.create(
            user=self.users[1],
            category="fc",
            what="apple pie",
            when=timezone.make_aware(arrow.utcnow().replace(hours=-1).naive),
            measure="skin",
            quantity=6,
            extra=json.dumps({"ndbno": "11362"})
        )

        suggestions = Entry.get_suggestions(
            user=self.users[0], keyword="apple")
        self.assertEqual(len(suggestions), 2)

    def test_entry_suggestion_order(self):
        Entry.objects.create(
            user=self.users[0],
            category="fc",
            what="apple pie",
            when=timezone.make_aware(arrow.utcnow().naive),
            measure="slice",
            quantity=6,
            extra=json.dumps({"ndbno": 22})
        )
        Entry.objects.create(
            user=self.users[0],
            category="fc",
            what="old apple pie",
            when=timezone.make_aware(arrow.utcnow().replace(days=-10).naive),
            measure="slice",
            quantity=6,
            extra=json.dumps({"ndbno": 22})
        )

        suggestions = Entry.get_suggestions(user=self.users[0], keyword="apple")
        self.assertEqual(len(suggestions), 3)
        self.assertEqual(suggestions[0]["name"], "apple pie")
        self.assertEqual(suggestions[2]["name"], "old apple pie")

