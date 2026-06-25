from django.contrib import admin
from .models import Resume, Experience, Education, Skill, Project, Certification

class ExperienceInline(admin.TabularInline):
    model = Experience
    extra = 0

class EducationInline(admin.TabularInline):
    model = Education
    extra = 0

class SkillInline(admin.TabularInline):
    model = Skill
    extra = 0

class ProjectInline(admin.TabularInline):
    model = Project
    extra = 0

class CertificationInline(admin.TabularInline):
    model = Certification
    extra = 0

@admin.register(Resume)
class ResumeAdmin(admin.ModelAdmin):
    list_display = ['title', 'user', 'full_name', 'template', 'created_at', 'updated_at']
    list_filter = ['template', 'created_at']
    search_fields = ['title', 'full_name', 'user__username', 'user__email']
    inlines = [ExperienceInline, EducationInline, SkillInline, ProjectInline, CertificationInline]
