from venv import create
from django.contrib.auth.models import User, Group
from django.db import transaction
from rest_framework import serializers
from heros.api.models import Document, DocumentRelation


class UserSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = User
        fields = ['url', 'username', 'email', 'groups']


class GroupSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Group
        fields = ['url', 'name']




class DocumentListItemSerializer(serializers.ModelSerializer):
    isShort = serializers.ReadOnlyField(default=True)
    class Meta:
        model = Document
        fields = "__all__"


class DocumentRelationSerializerAsBase(serializers.ModelSerializer):
    document_related = DocumentListItemSerializer(many=False,read_only=True)
    # document_related_id = serializers.PrimaryKeyRelatedField(queryset=Document.objects.all())
    document_related_id = serializers.IntegerField()
    # zapato = serializers.CharField(write_only=True)

    class Meta:
        model = DocumentRelation
        fields = ["id","document_related_id","document_related","relation"]

class DocumentRelationSerializerAsRelated(serializers.ModelSerializer):
    document_base = DocumentListItemSerializer(many=False,read_only=True)
    # document_related_id = serializers.PrimaryKeyRelatedField(queryset=Document.objects.all())
    document_base_id = serializers.IntegerField()
    # zapato = serializers.CharField(write_only=True)

    class Meta:
        model = DocumentRelation
        fields = ["id","document_base_id","document_base","relation"]        

class DocumentSerializer(serializers.ModelSerializer):
    relations_as_base = DocumentRelationSerializerAsBase(many=True,required=False)
    relations_as_related = DocumentRelationSerializerAsRelated(many=True, required=False)

    def create(self, validated_data):

        with transaction.atomic():
            relations_as_base = []
            relations_as_related = []
            if "relations_as_base" in validated_data:
                relations_as_base = validated_data.pop("relations_as_base")
            if "relations_as_related" in validated_data:
                relations_as_related = validated_data.pop("relations_as_related")                
            doc = Document.objects.create(**validated_data)
            for relation in relations_as_base:
                DocumentRelation.objects.create(
                    document_base=doc,
                    document_related_id=relation.get("document_related_id"), 
                    relation=relation.get("relation"))            
            for relation in relations_as_related:
                DocumentRelation.objects.create(
                    document_base_id=relation.get("document_base_id"), 
                    document_related=doc,
                    relation=relation.get("relation"))
        return doc

    class Meta:
        model = Document
        fields = ['id','document_type',
        'code','data','relations_as_base','relations_as_related']
        #To authomatize rendering of nested relations without specific serializer
        #depth = 1 

   