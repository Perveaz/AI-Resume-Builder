import os
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status

try:
    from mistralai import Mistral
    MISTRAL_AVAILABLE = True
except ImportError:
    MISTRAL_AVAILABLE = False


# ── Template definitions ───────────────────────────────────────────────
# Each template targets a different user type and has its own prompt style.

TEMPLATES = {
    "student": {
        "name": "Student / Entry-Level",
        "target": "Fresh graduates, interns, or candidates with < 2 years experience",
        "tone": "enthusiastic yet professional",
        "bullet_style": "action-verb led, achievement-focused even for small wins",
        "length": "concise — 2-3 sentences for summary, 2-3 bullets per role",
    },
    "professional": {
        "name": "Mid-Level Professional",
        "target": "Professionals with 3-10 years experience",
        "tone": "confident, results-oriented, data-driven",
        "bullet_style": "STAR method (Situation→Task→Action→Result) with metrics",
        "length": "balanced — 3-4 sentences for summary, 3-4 bullets per role",
    },
    "executive": {
        "name": "Senior / Executive",
        "target": "Directors, VPs, C-suite with 10+ years experience",
        "tone": "authoritative, strategic, board-level language",
        "bullet_style": "impact-first with P&L, headcount, or revenue figures",
        "length": "substantive — 4-5 sentences for summary, 4-5 high-impact bullets",
    },
}

# ── Prompt templates ───────────────────────────────────────────────────

PROMPTS = {
    "summary": """
You are an expert resume writer crafting a professional summary for a {template_name} resume.

Target user: {target}
Tone: {tone}
Length guideline: {length}

Candidate context provided by user:
{context}

Write ONLY the summary paragraph. No labels, no quotes, no commentary.
Make it compelling, specific, and tailored to the target user type.
""",

    "experience": """
You are an expert resume writer generating experience bullet points for a {template_name} resume.

Target user: {target}
Tone: {tone}
Bullet style: {bullet_style}
Length guideline: {length}

Job context provided by user:
{context}

Write ONLY 3-5 bullet points. Each starts with a strong action verb.
Format: one bullet per line, each starting with •
No labels, no commentary, no extra blank lines.
""",

    "project": """
You are an expert resume writer writing a project description for a {template_name} resume.

Target user: {target}
Tone: {tone}
Length guideline: {length}

Project context provided by user:
{context}

Write ONLY the project description (2-3 sentences).
Highlight the problem solved, technologies used, and measurable impact.
No labels, no quotes, no commentary.
""",

    "skills": """
You are an expert resume writer suggesting a skills list for a {template_name} resume.

Target user: {target}
Tone: {tone}

Candidate context:
{context}

Return ONLY a comma-separated list of 8-12 relevant technical and soft skills.
Order from most to least impressive for this candidate level.
No labels, no commentary.
""",
}


def get_client():
    key = os.environ.get('MISTRAL_API_KEY', '')
    if not key or not MISTRAL_AVAILABLE:
        return None
    return Mistral(api_key=key)


class GenerateContentView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        content_type = request.data.get('type', 'summary')
        context = request.data.get('context', '').strip()
        template_key = request.data.get('template', 'professional')

        # Validate
        if content_type not in PROMPTS:
            return Response(
                {'error': f'Unknown type "{content_type}". Use: summary, experience, project, skills'},
                status=400
            )
        if not context:
            return Response({'error': '"context" field is required.'}, status=400)
        if template_key not in TEMPLATES:
            template_key = 'professional'

        client = get_client()
        if client is None:
            return Response({
                'error': 'Mistral AI not configured. Add MISTRAL_API_KEY to backend/.env'
            }, status=503)

        tmpl = TEMPLATES[template_key]
        prompt = PROMPTS[content_type].format(
            template_name=tmpl['name'],
            target=tmpl['target'],
            tone=tmpl['tone'],
            bullet_style=tmpl.get('bullet_style', ''),
            length=tmpl['length'],
            context=context,
        )

        try:
            response = client.chat.complete(
                model='mistral-small-latest',
                messages=[{'role': 'user', 'content': prompt}],
                max_tokens=600,
                temperature=0.7,
            )
            generated = response.choices[0].message.content.strip()

            # Validation: reject empty or suspiciously short output
            if len(generated) < 20:
                return Response({'error': 'AI returned insufficient content. Try a more detailed context.'}, status=500)

            return Response({
                'content': generated,
                'template': template_key,
                'type': content_type,
            })

        except Exception as e:
            return Response({'error': str(e)}, status=500)


class TemplatesInfoView(APIView):
    """Returns available template metadata — useful for frontend dropdowns."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response({
            key: {
                'name': val['name'],
                'target': val['target'],
                'tone': val['tone'],
            }
            for key, val in TEMPLATES.items()
        })
