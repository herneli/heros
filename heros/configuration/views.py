from datetime import date
from django.shortcuts import render
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets
from rest_framework import filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.forms.models import model_to_dict
from collections import OrderedDict
from django.shortcuts import render
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from heros.configuration.models import Package, PackageVersion, ConfigDocument, ConfigInfo
from heros.configuration.serializers import PacakgeSerializer, PackageVersionSerializer,  ConfigDocumentSerializer, ConfigInfoSerializer
from heros.configuration import helpers
from heros.configuration.git import PackageRepository
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
        return Response([])


    @action(methods=['get'], detail=True)
    def update_remote_status(self, request, pk=None):
        package = Package.objects.get(pk=pk)
        repo = PackageRepository(package)
        repo.update_remote_status()
        return Response("Done")

    @action(methods=['get'], detail=True)
    def available_branches(self, request, pk=None):
        package = Package.objects.get(pk=pk)
        repo = PackageRepository(package)
        branches = repo.get_available_branches()
        return Response(branches)        




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
        new_version = PackageVersion.objects.create(
            package=version.package, 
            version=request.data.get("version"),
            remote_commit=version.remote_commit,
            local_commit=version.local_commit
            )
        for config_document in version.config_documents.all():
            config_document.id = None
            config_document.package_version = new_version
            config_document.save()
        if new_version.package.remote:
            new_version.refresh_from_db()
            repo = PackageRepository(new_version.package, new_version)
            repo.create_version_branch(from_version=version.version)
            repo.checkout_version()
            repo.write_documents_to_repo()
            repo.commit_and_push("Copy version "+ str(datetime.now()))            
        return Response("Done")

    @action(methods=['post'], detail=True)
    def publish(self, request, pk=None, package_pk=None ):
        version = PackageVersion.objects.get(pk=pk)
        repo = PackageRepository(version.package, version)
        repo.checkout_version()
        repo.write_documents_to_repo()
        repo.commit_and_push("Publish "+ str(datetime.now()))
        return Response("Done")

    @action(methods=['get'], detail=True)
    def import_remote(self, request, pk=None, package_pk=None ):
        version = PackageVersion.objects.get(pk=pk)
        repo = PackageRepository(version.package, version)
        repo.import_remote_package()
        return Response("Done")        



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



