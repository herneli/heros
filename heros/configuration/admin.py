from django.contrib import admin

# Register your models here.
from django.contrib import admin
from heros.configuration.models import Package, PackageVersion, ConfigInfo, ConfigDocument

# Register your models here.
admin.site.register(Package)
admin.site.register(PackageVersion)
admin.site.register(ConfigInfo)
admin.site.register(ConfigDocument)
