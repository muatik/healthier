import base64
import json
from datetime import datetime

import arrow
from django.contrib.auth.models import User
from django.test import Client
from django.test import TestCase
from django.utils import timezone

from entries.models import Entry, Nutrient, UserProfile, UserWeight


class SetupTestCase(TestCase):
    
    def get_authenticated_client(self, user):
        credentials = base64.b64encode(
            "{}:{}".format(user.username, "123456").encode())
        c = Client()
        c.defaults['HTTP_AUTHORIZATION'] = 'Basic {}'.format(
            credentials.decode())
        return c

    def setUp(self):
        user1 = User(email="user1@gmail.com", username="user1@gmail.com")
        user1.set_password("123456")
        user1.save()
        UserProfile.objects.create(
            user=user1, birth_date=datetime.now().date(),
            height=177, gender=UserProfile.MALE
        ).save()

        user2 = User(email="user2@gmail.com", username="user2@gmail.com")
        user2.save()
        user1.set_password("123456")
        UserProfile.objects.create(
            user=user2, birth_date=datetime.now().date(),
            height=170, gender=UserProfile.FEMALE
        ).save()

        UserWeight.objects.create(
            user=user1,
            date=timezone.make_aware(arrow.utcnow().naive),
            weight=67)

        UserWeight.objects.create(
            user=user1,
            date=timezone.make_aware(arrow.utcnow().naive),
            weight=62)

        self.users = [user1, user2]

        self.entries = [{
            "user": user1,
            "category": Entry.CATEGORIES.FOOD_CONSUMPTION,
            "what": "apple",
            "when": timezone.make_aware(arrow.utcnow().replace(days=-3).naive),
            "measure": "skin",
            "quantity": 3,
            "extra": json.dumps({'ndbno': "11362"})  # potato
        }, {
            "user": user1,
            "category": Entry.CATEGORIES.FOOD_CONSUMPTION,
            "what": "banana",
            "when": timezone.make_aware(arrow.utcnow().replace(hours=-5).naive),
            "measure": "cup, mashed",
            "quantity": 2,
            "extra": json.dumps({'ndbno': "09040"})  # bread
        }, {
            "user": user1,
            "category": Entry.CATEGORIES.PHYSICAL_ACTIVITY,
            "what": "running",
            "when": timezone.make_aware(arrow.utcnow().replace(hours=-5).naive),
            "measure": "minutes",
            "quantity": 30
        }, {
            "user": user2,
            "category": Entry.CATEGORIES.FOOD_CONSUMPTION,
            "what": "banana",
            "when": timezone.make_aware(arrow.utcnow().replace(hours=-5).naive),
            "measure": "cup, mashed",
            "quantity": 2,
            "extra": json.dumps({'ndbno': "09040"})  # bread
        }, {
            "user": user2,
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
