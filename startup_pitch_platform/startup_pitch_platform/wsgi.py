"""
WSGI config for startup_pitch project.
"""

import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'startup_pitch_platform.settings')


application = get_wsgi_application()
