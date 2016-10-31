"""healthcare_p1 URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/1.10/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  url(r'^$', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  url(r'^$', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.conf.urls import url, include
    2. Add a URL to urlpatterns:  url(r'^blog/', include('blog.urls'))
"""
from django.conf.urls import url, include
from django.contrib import admin

from entries import views

urlpatterns = [
    url(r"^entries/$", views.EntryView.as_view()),
    url(r"^entries/(?P<entry_id>.+)/nutrients/$", views.NutrientsView.as_view()),
    url(r"^food/$", views.FoodSuggestionView.as_view()),
    url(r"^food/(?P<ndbno>.+)/measures/$", views.FoodReport.as_view()),
    url(r"^activities/$", views.ActivitySuggestionView.as_view()),
    url(r"^reports/$", views.Reports.as_view()),
    url(r"^recipes/$", views.RecipesView.as_view()),
    url(r"^recipes/(?P<pk>\d+)/$", views.RecipesView.as_view()),
    url(r"^recipes/(?P<recipe_id>\d+)/ingredients/$",
        views.RecipeIngredientsView.as_view()),
    url(r"^recipes/(?P<recipe_id>\d+)/ingredients/(?P<pk>\d+)/$",
        views.RecipeIngredientsView.as_view()),
]
