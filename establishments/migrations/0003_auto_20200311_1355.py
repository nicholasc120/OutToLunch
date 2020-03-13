# Generated by Django 3.0.3 on 2020-03-11 19:55

from django.db import migrations, models
import uuid


class Migration(migrations.Migration):

    dependencies = [
        ('establishments', '0002_auto_20200311_1354'),
    ]

    operations = [
        migrations.AlterField(
            model_name='establishment',
            name='establishment_id',
            field=models.UUIDField(default=uuid.UUID('59809810-cef5-492d-bb21-754462a6c794'), primary_key=True, serialize=False),
        ),
    ]