from datetime import date
from django.shortcuts import render
from django.forms.models import model_to_dict
from django_filters.rest_framework import DjangoFilterBackend
from django.shortcuts import render
from django.db import transaction
from rest_framework import viewsets
from rest_framework import filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from collections import OrderedDict
from heros.configuration.models import Package, PackageVersion, ConfigDocument, ConfigInfo
from heros.configuration.serializers import PacakgeSerializer, PackageVersionSerializer,  ConfigDocumentSerializer, ConfigInfoSerializer
from heros.configuration import helpers
from heros.configuration.git import GitPackage, PackageRepository
from datetime import datetime
import json

# Create your views here.
class PackageViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows groups to be viewed or edited.
    """
    queryset = Package.objects.filter()
    serializer_class = PacakgeSerializer
    filter_backends = [DjangoFilterBackend,filters.OrderingFilter]
    filterset_fields = {
        'code': ['exact'],
    }
    @action(methods=['get'], detail=False)
    def remote_list(self, request, pk=None ):
        repo = PackageRepository()
        packages = repo.get_packages()
        return_packages = []
        for package_code, package_data in packages.items():
            existing_package = Package.objects.filter(code=package_code).first()
            existing_package 
            return_packages.append({
                "code": package_code,
                "name": package_data.get("name",package_code),
                "remote": package_data.get("remote"),
                "local": bool(existing_package)

            })
        return Response(return_packages)

    

    @action(methods=['get'], detail=True)
    def update_remote_status(self, request, pk=None):
        package = Package.objects.get(pk=pk)
        repo = GitPackage(package)
        repo.update_remote_status()
        return Response("Done")

    @action(methods=['post'], detail=True, url_path=r'import/(?P<version>[\w\.]+)', url_name="import-version")
    def import_version(self, request, pk=None, version=None):
        package = Package.objects.get(pk=pk)
        with transaction.atomic():
            new_version = PackageVersion.objects.create(package=package, version=version)
            repo = GitPackage(package, new_version)
            repo.import_remote_package()
            return Response("Done")        

    @action(methods=['get'], detail=True)
    def missing_branches(self, request, pk=None):
        package = Package.objects.get(pk=pk)
        repo = GitPackage(package)
        branches = repo.get_available_branches()
        return Response(branches)

    @action(methods=['get'], detail=False)
    def version_by_code(self, request, pk=None):
        pass


class PackageVersionViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows groups to be viewed or edited.
    """
    def get_queryset(self):
        return PackageVersion.objects.filter(package=self.kwargs['package_pk'])

    serializer_class = PackageVersionSerializer
    filter_backends = [DjangoFilterBackend,filters.OrderingFilter]
    filterset_fields = {
        'version': ['exact'],
    }

    @action(methods=['post'], detail=True)
    def copy(self, request, pk=None, package_pk=None ):
        version = PackageVersion.objects.get(pk=pk)
        if version.package.remote:
            repo = GitPackage(version.package)
            if request.data.get("version") in repo.get_branches():
                raise Exception("Remote branch already exists")
        with transaction.atomic():
            new_version = PackageVersion.objects.create(
                package=version.package, 
                version=request.data.get("version"),
                remote_commit=version.remote_commit,
                local_commit=version.local_commit
                )
            new_version.dependencies.set(version.dependencies.all())
            new_version.save()
            for config_document in version.config_documents.all():
                config_document.id = None
                config_document.package_version = new_version
                config_document.save()
            if new_version.package.remote:
                repo.set_version(new_version)
                new_version.refresh_from_db()
                repo.create_version_branch(from_version=version.version)
                repo.checkout_version()
                repo.write_documents_to_repo()
                repo.commit_and_push("Copy version "+ str(datetime.now()))            
        return Response("Done")

    @action(methods=['post'], detail=True)
    def publish(self, request, pk=None, package_pk=None ):
        version = PackageVersion.objects.get(pk=pk)
        repo = GitPackage(version.package, version)
        repo.checkout_version()
        repo.write_documents_to_repo()
        repo.commit_and_push("Publish "+ str(datetime.now()))
        return Response("Done")

    @action(methods=['get'], detail=True)
    def import_remote(self, request, pk=None, package_pk=None ):
        version = PackageVersion.objects.get(pk=pk)
        repo = GitPackage(version.package, version)
        repo.import_remote_package()
        return Response("Done")        

class VersionViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows groups to be viewed or edited.
    """
    queryset = PackageVersion.objects.filter()
    serializer_class = PackageVersionSerializer
    filter_backends = [DjangoFilterBackend,filters.OrderingFilter]
    filterset_fields = {
        'package__code': ["exact"],
        'version': ['exact'],
    }



def string_to_json(json_string):
    return json.loads(json_string, object_pairs_hook=OrderedDict)

@api_view(["GET"])
def config_info(request, model):
    """
    Get model information
    """
    model_info = ConfigInfo.objects.filter(document_type=model).first()
    if model_info:
        return Response(string_to_json(model_info.data))
    else:
        return Response(status=status.HTTP_404_NOT_FOUND)

@api_view(["POST"])
def get_type_members(request):
    """
    Get model information
    """
    members = helpers.get_type_members(
        object_type=request.data.get("type",None),
        language=request.data.get("language",None),
        packages=request.data.get("packages",None),
        exclude_properties=request.data.get("exclude_properties", False),
        exclude_methods=request.data.get("exclude_methods", False))
    return Response(members)

class ConfigDocumentViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows groups to be viewed or edited.
    """
    def get_queryset(self):
        return ConfigDocument.objects.filter(document_type=self.kwargs.get("model"))

    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)

    serializer_class = ConfigDocumentSerializer
    filter_backends = [DjangoFilterBackend,filters.OrderingFilter]

    filterset_fields = {
        'package_version_id': ['in'],
    }



