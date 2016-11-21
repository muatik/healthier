from rest_framework import serializers

from entries.models import Entry, Nutrient


class EntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = Entry
        fields = ["id", "category", "what", "when", "quantity", "measure"]
        read_only_fields = ["id"]


class NutrientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Nutrient
        fields = ["category", "quantity", "unit", "label"]


