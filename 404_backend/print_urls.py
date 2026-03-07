import os, sys, django
sys.path.append(r'c:\Users\Kashi\Desktop\404_backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'car_care.settings')
django.setup()
from django.urls import get_resolver
def print_urls(urllist, prefix=''):
    for entry in urllist:
        if hasattr(entry, 'url_patterns'):
            print_urls(entry.url_patterns, prefix + str(entry.pattern))
        else:
            print(prefix + str(entry.pattern))
print_urls(get_resolver().url_patterns)
