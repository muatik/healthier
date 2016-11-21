import json

from django.db.models import Sum
from rest_framework.generics import ListCreateAPIView, \
    ListAPIView
from rest_framework.response import Response
from rest_framework.views import APIView

from entries.fcd import FCD
from entries.models import Entry, Nutrient
from entries.serializers import EntrySerializer, NutrientSerializer


class EntryView(ListCreateAPIView):
    queryset = Entry.objects.all().order_by("-when")
    serializer_class = EntrySerializer

    def perform_create(self, serializer):
        entry = serializer.save()
        entry.insert_nutrients(serializer.initial_data)


class NutrientsView(ListAPIView):
    serializer_class = NutrientSerializer

    def get_queryset(self):
        entry_id = self.kwargs["entry_id"]
        return Nutrient.objects.filter(entry=entry_id)


class FoodSuggestionView(APIView):
    def get(self, request, frm=None):
        keyword = request.query_params.get("q").strip()

        history = []
        for i in Entry.objects.filter(what__contains=keyword):
            if not i.extra:
                continue

            history.append({
                "name": i.what,
                "ndbno": json.loads(i.extra).get("ndbno", "")
            })

        try:
            foods = FCD.find(keyword)
        except KeyError:
            foods = []

        return Response(history + foods)
        # return Response(foods)


class FoodReport(APIView):
    def get(self, request, ndbno, frm=None):
        result = FCD.get_measures(ndbno)
        return Response(result)


class ActivitySuggestionView(APIView):
    def get(self, request, frm=None):
        return Response([
            {"id": 1, "name": "ARNOLD DUMBBELL PRESS"},
            {"id": 2, "name": "Hill sprint"},
            {"id": 3, "name": "jump rope"},
            {"id": 4, "name": "Long Jumps"},
            {"id": 5, "name": "Pushups"},
            {"id": 6, "name": "Bicycle Crunches"},
            {"id": 7, "name": "Mountain Climbers"},
            {"id": 8, "name": "Trail running"},
        ])


class Reports(APIView):
    def get(self, request, frm=None):
        outtake = Nutrient.objects.filter(
            category="o"
        ).aggregate(Sum("quantity"))

        intake = Nutrient.objects.filter(
            category="i", label="Energy", unit="kcal"
        ).aggregate(Sum("quantity"))

        return Response({
            "energy": {
                "intake": intake["quantity__sum"],
                "outtake": outtake["quantity__sum"]
            }
        })
