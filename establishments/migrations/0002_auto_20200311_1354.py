# Generated by Django 3.0.3 on 2020-03-11 19:54

from django.db import migrations, models
import uuid


class Migration(migrations.Migration):

    dependencies = [
        ('establishments', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='establishment',
            name='establishment_id',
            field=models.UUIDField(default=uuid.UUID('c35710f4-5cc7-4067-8fbc-a4a041dc7726'), primary_key=True, serialize=False),
        ),
    ]
