from django.shortcuts import render

def home_view(request):
    return render(request, 'index.html')  # Renders index.html

def pitches_view(request):
    return render(request, 'pitches.html')  # Renders pitches.html

def investors_view(request):
    return render(request, 'investors.html')  # Renders investors.html

def about_view(request):
    return render(request, 'about.html')  # Renders about.html

def login_view(request):
    return render(request, 'login.html')  # Renders login.html

def register_view(request):
    return render(request, 'register.html')  # Renders register.html