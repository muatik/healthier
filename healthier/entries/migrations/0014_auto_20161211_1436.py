# -*- coding: utf-8 -*-
# Generated by Django 1.10.3 on 2016-12-11 14:36
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('entries', '0013_entry_totalcalorie'),
    ]

    operations = [
        migrations.AlterField(
            model_name='entry',
            name='totalCalorie',
            field=models.FloatField(null=True),
        ),
    ]