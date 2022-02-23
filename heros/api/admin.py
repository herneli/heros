from django.contrib import admin
from heros.api.models import Document, DocumentRelation

# Register your models here.
admin.site.register(Document)
admin.site.register(DocumentRelation)