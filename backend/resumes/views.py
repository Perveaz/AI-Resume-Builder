from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Resume, Experience, Education, Skill, Project, Certification
from .serializers import (ResumeSerializer, ResumeListSerializer, ExperienceSerializer,
                           EducationSerializer, SkillSerializer, ProjectSerializer, CertificationSerializer)

class ResumeListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method == 'GET':
            return ResumeListSerializer
        return ResumeSerializer

    def get_queryset(self):
        return Resume.objects.filter(user=self.request.user).order_by('-updated_at')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class ResumeDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ResumeSerializer

    def get_queryset(self):
        return Resume.objects.filter(user=self.request.user)

class SectionView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    SECTION_MAP = {
        'experiences': (Experience, ExperienceSerializer),
        'education': (Education, EducationSerializer),
        'skills': (Skill, SkillSerializer),
        'projects': (Project, ProjectSerializer),
        'certifications': (Certification, CertificationSerializer),
    }

    def get_resume(self, resume_id, user):
        try:
            return Resume.objects.get(id=resume_id, user=user)
        except Resume.DoesNotExist:
            return None

    def get(self, request, resume_id, section):
        resume = self.get_resume(resume_id, request.user)
        if not resume:
            return Response({'error': 'Resume not found'}, status=404)
        model, serializer_class = self.SECTION_MAP.get(section, (None, None))
        if not model:
            return Response({'error': 'Invalid section'}, status=400)
        items = model.objects.filter(resume=resume).order_by('order')
        return Response(serializer_class(items, many=True).data)

    def post(self, request, resume_id, section):
        resume = self.get_resume(resume_id, request.user)
        if not resume:
            return Response({'error': 'Resume not found'}, status=404)
        model, serializer_class = self.SECTION_MAP.get(section, (None, None))
        if not model:
            return Response({'error': 'Invalid section'}, status=400)
        serializer = serializer_class(data=request.data)
        if serializer.is_valid():
            serializer.save(resume=resume)
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

class SectionItemView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    SECTION_MAP = {
        'experiences': (Experience, ExperienceSerializer),
        'education': (Education, EducationSerializer),
        'skills': (Skill, SkillSerializer),
        'projects': (Project, ProjectSerializer),
        'certifications': (Certification, CertificationSerializer),
    }

    def get_item(self, item_id, section, user):
        model, serializer_class = self.SECTION_MAP.get(section, (None, None))
        if not model:
            return None, None
        try:
            item = model.objects.get(id=item_id, resume__user=user)
            return item, serializer_class
        except model.DoesNotExist:
            return None, None

    def put(self, request, resume_id, section, item_id):
        item, serializer_class = self.get_item(item_id, section, request.user)
        if not item:
            return Response({'error': 'Not found'}, status=404)
        serializer = serializer_class(item, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    def delete(self, request, resume_id, section, item_id):
        item, _ = self.get_item(item_id, section, request.user)
        if not item:
            return Response({'error': 'Not found'}, status=404)
        item.delete()
        return Response(status=204)
