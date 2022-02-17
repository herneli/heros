
from django.urls import path, include
from rest_framework import routers
from . import views

router = routers.DefaultRouter()
router.register(r'users', views.UserViewSet)
router.register(r'groups', views.GroupViewSet)
router.register(r'documents', views.DocumentViewSet)
router.register(r'document_realtions', views.DocumentRelationViewSet)

urlpatterns = [
    path('', include(router.urls)),
]