from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import InstrumentViewSet, KitViewSet

router = DefaultRouter()
router.register(r'instruments', InstrumentViewSet, basename='instrument')
router.register(r'kits', KitViewSet, basename='kit')

urlpatterns = [
    path('', include(router.urls)),
]