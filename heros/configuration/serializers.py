from venv import create
from django.contrib.auth.models import User, Group
from django.db import transaction
from rest_framework import serializers
from heros.configuration.models import Package, PackageVersion ,ConfigDocument, ConfigInfo


class PacakgeShortSerializer(serializers.ModelSerializer):
    class Meta:
        model = Package
        fields = "__all__"

class PackageVersionSerializer(serializers.ModelSerializer):
    package = PacakgeShortSerializer()
    class Meta:
        model = PackageVersion
        fields = "__all__"

        
class PacakgeSerializer(serializers.ModelSerializer):
    versions = PackageVersionSerializer(many=True, read_only=True)
    def create(self, validated_data):
        with transaction.atomic():
            package = Package.objects.create(**validated_data)
            if (not package.remote):
                version = PackageVersion.objects.create(package=package, version="1.0.0",remote_commit="initial", local_commit="initial")
            return package
            

    class Meta:
        model = Package
        fields = "__all__"


class ConfigDocumentSerializer(serializers.ModelSerializer):
    full_code = serializers.StringRelatedField()
    class Meta:
        model = ConfigDocument
        fields = "__all__"


class ConfigInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = ConfigInfo
        fields = "__all__"

