from venv import create
from django.contrib.auth.models import User, Group
from django.db import transaction
from numpy import require
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
    initial_version = serializers.CharField(required=False)
    def create(self, validated_data):
        with transaction.atomic():
            initial_version = validated_data.pop("initial_version",None)
            package = Package.objects.create(**validated_data)
            if (initial_version):
                version = PackageVersion.objects.create(package=package, version=initial_version,remote_commit="initial", local_commit="initial")
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

