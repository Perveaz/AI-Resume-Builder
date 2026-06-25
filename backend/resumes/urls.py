from django.urls import path
from .views import ResumeListCreateView, ResumeDetailView, SectionView, SectionItemView

urlpatterns = [
    path('', ResumeListCreateView.as_view(), name='resume-list'),
    path('<int:pk>/', ResumeDetailView.as_view(), name='resume-detail'),
    path('<int:resume_id>/<str:section>/', SectionView.as_view(), name='section'),
    path('<int:resume_id>/<str:section>/<int:item_id>/', SectionItemView.as_view(), name='section-item'),
]
