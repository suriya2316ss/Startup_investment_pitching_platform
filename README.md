# 🚀 Startup Investment Pitching Platform

A comprehensive, AI-powered web platform that connects startups with potential investors. This platform allows startup founders to pitch their ideas, while investors can explore, evaluate, and invest in emerging businesses through an interactive and dynamic interface.

----

## 🌟 Features

- 🤖 AI-powered chatbot using OpenAI API for pitch guidance and Q&A
- 📱 Fully responsive modern UI (mobile-friendly)
- 🔐 Secure user authentication and profile management
- 📄 Dynamic pitch creation, editing, and presentation
- 🧠 Investor directory with smart search and filtering
- 🔄 Real-time communication via WebSocket (Django Channels)
- 📊 Admin panel for platform moderation and analytics

---

## 🛠️ Tech Stack

**Backend**  
- Python 3.x  
- Django  
- Django REST Framework  
- Django Channels (for WebSockets)

**Frontend**  
- HTML5, CSS3  
- JavaScript 

**Database**  
- SQLite (Development)  
- PostgreSQL (Production)

**Deployment**  
- Docker  
- Nginx + Gunicorn  
- SSL via Let's Encrypt

**AI Integration**  
- OpenAI GPT API for chatbot and pitch improvement suggestions

---

## 📦 Installation & Setup

### 🔧 Prerequisites

- Python 3.8 or higher  
- `pip` (Python package manager)  
- Docker (optional for containerized deployment)

### 💻 Local Development Setup

```bash
# 1. Clone the repository
git clone https://github.com/suriya2311ss/startup-pitch-platform.git
cd startup-pitch-platform

# 2. Create and activate a virtual environment
python -m venv venv
source venv/bin/activate       # For Linux/macOS
venv\Scripts\activate          # For Windows

# 3. Install project dependencies
pip install -r requirements.txt

# 4. Apply migrations
python manage.py migrate

# 5. Create a superuser account
python manage.py createsuperuser

# 6. Run the development server
python manage.py runserver
