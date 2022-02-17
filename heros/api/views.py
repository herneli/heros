from datetime import datetime
from xmlrpc.client import Boolean
from django.contrib.auth.models import User, Group
from django.http import Http404
from rest_framework import viewsets
from rest_framework import permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import filters
from django_filters.rest_framework import DjangoFilterBackend
from heros.api.serializers import UserSerializer, GroupSerializer, DocumentSerializer, DocumentRelationSerializer
from heros.api.models import Document, DocumentRelation
import datetime
import json
class UserViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows users to be viewed or edited.
    """
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    @action(methods=['get'], detail=True, url_path=r'get_name/(?P<name>\w+)', url_name="get-name")
    def get_name(self, request, name, pk=None ):
        user = User.objects.get(pk=pk)
        return Response({"email": user.email, "name": name })


class GroupViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows groups to be viewed or edited.
    """
    queryset = Group.objects.all()
    serializer_class = GroupSerializer
    permission_classes = [permissions.IsAuthenticated]

class DocumentViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows groups to be viewed or edited.
    """
    queryset = Document.objects.filter(deleted=False)
    serializer_class = DocumentSerializer
    filter_backends = [DjangoFilterBackend,filters.OrderingFilter]

    filterset_fields = {
        'code': ['exact','contains'],
    }
    # # permission_classes = [permissions.IsAuthenticated]    

    def get_queryset(self):
        """
        This view should return a list of all the purchases
        for the currently authenticated user.
        """
        show_deleted = self.request.query_params.get("show_deleted")
        if show_deleted == 'true':
            query = Document.objects.all()
        else:
            query = self.queryset
        print(type(show_deleted))
        return query

    @action(methods=['get'], detail=False, url_path=r'get_by_code/(?P<document_type>\w+)/(?P<code>\w+)', url_name="get-name")
    def get_by_code(self, request, document_type, code, pk=None ):
        document = Document.objects.filter(document_type=document_type, code=code).first()
        if not document:
            raise Http404()
        documentSerialized = DocumentSerializer(document).data    
        return Response(documentSerialized)

    @action(methods=['get'], detail=True)
    def delete_relation(self, request,  pk=None ):
        return Response()        

    def destroy(self, request, pk=None):
        doc = Document.objects.get(pk=pk)
        doc.deleted = True
        doc.deleted_at = datetime.datetime.now()
        doc.save()
        return Response()


class DocumentRelationViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows groups to be viewed or edited.
    """
    queryset = DocumentRelation.objects.all()
    serializer_class = DocumentRelationSerializer
    # permission_classes = [permissions.IsAuthenticated]        