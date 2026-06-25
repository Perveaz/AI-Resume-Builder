import os
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status

try:
    from mistralai import Mistral
    MISTRAL_AVAILABLE = True
except ImportError:
    MISTRAL_AVAILABLE = False


PROMPT_TEMPLATES = {
    'summary': (
        "Write a concise, compelling professional summary (3-4 sentences) for a resume. "
        "Tone: {tone}. Context: {context}. "
        "Return only the summary text, no labels or extra commentary."
    ),
    'experience': (
        "Write 3-4 strong bullet points describing job responsibilities and achievements. "
        "Role: {context}. Tone: {tone}. Use action verbs. "
        "Return only the bullet points, one per line starting with '•'."
    ),
    'project': (
        "Write a concise project description (2-3 sentences) for a resume. "
        "Project: {context}. Tone: {tone}. Highlight impact and technologies. "
        "Return only the description text."
    ),
}


def get_mistral_client():
    api_key = os.environ.get('MISTRAL_API_KEY', '')
    if not api_key or not MISTRAL_AVAILABLE:
        return None
    return Mistral(api_key=api_key)


class GenerateContentView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        content_type = request.data.get('type', 'summary')
        context = request.data.get('context', '')
        tone = request.data.get('tone', 'professional')

        if content_type not in PROMPT_TEMPLATES:
            return Response({'error': f'Unknown content type: {content_type}'}, status=400)
        if not context:
            return Response({'error': 'context is required'}, status=400)

        client = get_mistral_client()
        if client is None:
            return Response({
                'error': 'Mistral AI is not configured. Set MISTRAL_API_KEY in your environment.'
            }, status=503)

        prompt = PROMPT_TEMPLATES[content_type].format(tone=tone, context=context)

        try:
            response = client.chat.complete(
                model='mistral-small-latest',
                messages=[{'role': 'user', 'content': prompt}],
            )
            generated = response.choices[0].message.content.strip()
            return Response({'content': generated})
        except Exception as e:
            return Response({'error': str(e)}, status=500)
