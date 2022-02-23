from django.shortcuts import render
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets
from rest_framework import filters
from rest_framework.decorators import action
from rest_framework.response import Response
from heros.configuration.models import Package, PackageVersion, ConfigDocument, ConfigInfo
from heros.configuration.serializers import PacakgeSerializer, PackageVersionSerializer,  ConfigDocumentSerializer, ConfigInfoSerializer
from django.forms.models import model_to_dict
from collections import OrderedDict
from django.shortcuts import render
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from heros.configuration import helpers
import json

# Create your views here.
class PackageViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows groups to be viewed or edited.
    """
    queryset = Package.objects.filter()
    serializer_class = PacakgeSerializer
    filter_backends = [DjangoFilterBackend,filters.OrderingFilter]

    @action(methods=['get'], detail=False)
    def remote_list(self, request, pk=None ):
        return Response([])

    filterset_fields = {
        'code': ['exact'],
    }

class PackageVersionViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows groups to be viewed or edited.
    """
    def get_queryset(self):
        return PackageVersion.objects.filter(package=self.kwargs['package_pk'])

    serializer_class = PackageVersionSerializer
    filter_backends = [DjangoFilterBackend,filters.OrderingFilter]

    @action(methods=['post'], detail=True)
    def copy(self, request, pk=None, package_pk=None ):
        version = PackageVersion.objects.get(pk=pk)

        new_version = PackageVersion.objects.create(package=version.package, version=request.data.get("version"))
        for config_document in version.config_documents.all():
            config_document.id = None
            config_document.package_version = new_version
            config_document.save()
        return Response([])

    filterset_fields = {
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





# @api_view(["GET"])
# @permission_classes([permissions.AllowAny])
# def test(request):
#     """
#     Test
#     """
#     return Response({"message": "Hello world"})


# @api_view(["GET", "POST"])
# def config_data_set(request, model):
#     """
#     Pending documentation
#     """
#     # GET
#     if request.method == 'GET':
#         documents = ConfigDocument.objects.filter(
#             document_type=model).order_by('code')
#         return Response(documents.values())
#     # POST
#     elif request.method == 'POST':
#         return Response(helpers.create_config_document(model, request.data))


# @api_view(["GET", "PUT", "DELETE"])
# def config_data_single(request, model, id):
#     """
#     Pending documentation
#     """
#     # GET
#     if request.method == 'GET':
#         return Response(model_to_dict(ConfigDocument.objects.get(id=id)))
#     # PUT
#     elif request.method == 'PUT':
#         return Response(helpers.update_config_document(model, request.data, id))
#     # DELETE
#     elif request.method == 'DELETE':
#         return Response(helpers.delete_config_document(id))





# @api_view(["POST"])
# def get_object_members(request):
#     members = helpers.get_object_members(
#         request.data.get("type"), request.data.get("language"))
#     return Response(members)


# @api_view(["GET"])
# def script_new(request):
#     return helpers.script_new()
