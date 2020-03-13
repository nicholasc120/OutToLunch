import uuid
from django.db import models
from django.contrib.auth.models import AbstractUser

# Create your models here.


class SiteUser(AbstractUser):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    elo = models.IntegerField(null=False, default=0)