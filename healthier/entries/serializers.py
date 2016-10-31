import json

from rest_framework import serializers

from entries.models import Entry, Nutrient, Recipe, RecipeIngredient


class EntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = Entry
        fields = ["id", "category", "what", "when", "quantity", "measure"]
        read_only_fields = ["id"]


class NutrientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Nutrient
        fields = ["category", "quantity", "unit", "label"]


class RecipeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Recipe
        fields = ["id", "title", "totalCalorie"]
        read_only_fields = ["id"]


class RecipeIngredientSerializer(serializers.ModelSerializer):
    class Meta:
        model = RecipeIngredient
        fields = ["id", "what", "measure", "quantity", "nutrients"]
        read_only_fields = ["id", "nutrients"]

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        ret["nutrients"] = instance.getNutrients()
        return ret

    def create(self, validated_data):
        validated_data["nutrients"] = json.dumps(validated_data["nutrients"])
        return super().create(validated_data)
