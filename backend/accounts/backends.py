import time
from django.contrib.auth.backends import ModelBackend
from django.contrib.auth.models import User
from django.db.models import Q


class EmailOrUsernameBackend(ModelBackend):
    """
    Allows login with either email or username.
    Django's authenticate() always passes 'username' kwarg — we resolve it
    to the actual user here, supporting both email and username values.
    Includes timing-attack mitigation via a dummy hash check on miss.
    """

    def authenticate(self, request, username=None, password=None, **kwargs):
        if username is None or password is None:
            return None

        try:
            # Allow email or username in the 'username' field
            user = User.objects.get(Q(username=username) | Q(email__iexact=username))
        except User.DoesNotExist:
            # Mitigate timing attack — run a dummy check
            User().set_password(password)
            return None
        except User.MultipleObjectsReturned:
            # Edge case: duplicate emails — fall back to exact username match
            try:
                user = User.objects.get(username=username)
            except User.DoesNotExist:
                return None

        if user.check_password(password) and self.user_can_authenticate(user):
            return user
        return None
