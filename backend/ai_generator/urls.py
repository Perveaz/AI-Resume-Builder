from django.urls import path
from .views import GenerateContentView, TemplatesInfoView

urlpatterns = [
    path('generate/', GenerateContentView.as_view(), name='ai-generate'),
    path('templates/', TemplatesInfoView.as_view(), name='ai-templates'),
]
