# Startup Investment Pitching Platform

A comprehensive platform connecting startups with investors, featuring 3D animations, AI-powered chatbot, and dynamic pitch presentations.

## Features

- Interactive 3D animations using Three.js
- AI-powered chatbot for investment guidance
- Responsive design for all devices
- User authentication and profiles
- Pitch creation and management
- Investor directory and search
- Real-time WebSocket connections

## Technology Stack

- **Backend:** Python Django, Django REST Framework, Channels
- **Frontend:** HTML5, CSS3, JavaScript (with Three.js and GSAP)
- **Database:** SQLite (development), PostgreSQL (production)
- **Deployment:** Nginx, Gunicorn, Docker
- **AI Integration:** OpenAI API

## Installation

### Prerequisites

- Python 3.8 or higher
- pip (Python package manager)

### Setup

1. Clone the repository:

```bash
git clone https://github.com/yourusername/startup-pitch-platform.git
cd startup-pitch-platform
```

2. Create a virtual environment:

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:

```bash
pip install -r requirements.txt
```

4. Set up the database:

```bash
python manage.py migrate
```

5. Create a superuser:

```bash
python manage.py createsuperuser
```

6. Start the development server:

```bash
python manage.py runserver
```

The application will be available at http://localhost:8000/

## API Documentation

The API documentation is available at `/api/docs/` when the server is running.

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```
DEBUG=True
SECRET_KEY=your-secret-key
OPENAI_API_KEY=your-openai-api-key
```

## Deployment

### Docker

1. Build the Docker image:

```bash
docker build -t startup_pitch_platform .
```

2. Run the container:

```bash
docker run -p 8000:8000 startup_pitch_platform
```

### Traditional Deployment

1. Collect static files:

```bash
python manage.py collectstatic
```

2. Configure Nginx as a reverse proxy to Gunicorn.

3. Set up SSL certificates (Let's Encrypt recommended).

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Three.js for 3D animations
- OpenAI for AI integration
- Django and Django REST Framework
- GSAP for smooth animations
