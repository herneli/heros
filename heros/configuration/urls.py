
from django.urls import path, include
from rest_framework import routers
from rest_framework_nested import routers
from . import views

router = routers.SimpleRouter()
router.register(r'packages', views.PackageViewSet)
version_router = routers.NestedSimpleRouter(router, r'packages', lookup='package')
version_router.register(r'versions', views.PackageVersionViewSet, basename='pacakge-versions')

router.register(r'model/(?P<model>\w+)',views.ConfigDocumentViewSet, basename="model")
urlpatterns = [
    path('', include(router.urls)),
    path('', include(version_router.urls)),
    path('model/<model>/info', views.config_info),
    # path('model/<model>/data', views.config_data_set),
    # path('model/<model>/data/<id>', views.config_data_single),
    # path('object/members', views.get_object_members),

]