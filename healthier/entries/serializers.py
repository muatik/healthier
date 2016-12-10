from django.contrib.auth.models import User
from rest_framework import serializers

from entries.models import Entry, Nutrient, RecipeIngredient, Recipe, \
    UserProfile, UserWeight


class EntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = Entry
        fields = [
            "id", "category", "what", "when", "quantity", "measure", "extra"]
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
        fields = ["id", "what", "measure", "quantity", "nutrients", "ndbno"]
        read_only_fields = ["id", "nutrients"]

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        ret["nutrients"] = instance.get_nutrients()
        return ret

    def create(self, validated_data):
        # validated_data["nutrients"] = json.dumps(validated_data["nutrients"])
        return super().create(validated_data)


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ["birth_date", "gender", "height"]


class UserWeightSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserWeight
        fields = ["date", "weight"]


class UserSerializer(serializers.ModelSerializer):

    userprofile = UserProfileSerializer()
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ("id", "first_name", "last_name", "username",
                  "email", "password", "userprofile")
        read_only_fields = ["id"]

    def create(self, validated_data):
        profile_data = validated_data.pop("userprofile")
        password = validated_data["password"]
        user = User.objects.create(**validated_data)
        user.set_password(password)
        user.save()
        UserProfile.objects.create(user=user, **profile_data)
        return user

    def update(self, instance, validated_data):
        profile_data = validated_data.pop("userprofile")
        instance.email = validated_data["email"]
        instance.first_name = validated_data["first_name"]
        instance.last_name = validated_data["last_name"]
        instance.set_password(validated_data["password"])
        instance.save()

        ups = UserProfileSerializer(
            instance=instance.userprofile, data=profile_data)
        ups.is_valid(raise_exception=True)
        ups.save(**profile_data)

        return instance