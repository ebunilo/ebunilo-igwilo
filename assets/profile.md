# Profile

## Calistus Igwilo

**Senior Backend Engineer | DevOps Engineer**

📧 ebunloigwilo@gmail.com | 🌐 [travel.igwilo.com](https://travel.igwilo.com)

---

## Professional Summary

Results-driven Backend and DevOps Engineer with deep expertise in designing, building, and deploying production-grade distributed systems. Proven track record of architecting RESTful APIs, implementing payment integrations, orchestrating containerized microservices, and automating CI/CD pipelines. Passionate about writing clean, maintainable code and building infrastructure that scales.

---

## Technical Skills

### Backend Development

- **Languages**: Python 3.10+
- **Frameworks**: Django 5.x, Django REST Framework
- **API Design**: RESTful APIs, OpenAPI/Swagger documentation (drf-yasg)
- **Database**: PostgreSQL (schema design, indexing, migrations)
- **Async Processing**: Celery, Redis (task queues, message brokers)
- **Authentication**: JWT, session-based auth, password hashing
- **Third-Party Integrations**: Payment gateways (Chapa), webhooks

### DevOps & Infrastructure

- **Containerization**: Docker, Docker Compose
- **CI/CD**: GitHub Actions (automated testing, linting, deployment)
- **Web Servers**: Nginx (reverse proxy, SSL/TLS termination, static file caching)
- **Process Management**: Gunicorn
- **Cloud Deployment**: Linux servers, SSH-based deployments
- **Security**: Let's Encrypt SSL, environment variable management, secrets handling

### Development Practices

- **Version Control**: Git, GitHub
- **Testing**: Django test framework, unit testing
- **Code Quality**: Flake8 linting, code reviews
- **Documentation**: Swagger UI, ReDoc, Markdown

---

## Featured Project: ALX Travel App

A full-stack property management platform demonstrating end-to-end backend and DevOps capabilities.

**Live Demo**: [https://travel.igwilo.com/swagger/](https://travel.igwilo.com/swagger/)

### Architecture Overview

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Nginx     │────▶│  Gunicorn   │────▶│   Django    │
│  (Reverse   │     │  (WSGI)     │     │   REST API  │
│   Proxy)    │     └─────────────┘     └──────┬──────┘
└─────────────┘                                │
                                               ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Redis     │◀───▶│   Celery    │     │ PostgreSQL  │
│  (Broker)   │     │  (Worker)   │     │    (DB)     │
└─────────────┘     └─────────────┘     └─────────────┘
```

### Key Accomplishments

#### Backend Engineering

- **Designed RESTful API** with full CRUD operations for listings, bookings, users, and reviews using Django REST Framework
- **Implemented payment integration** with Chapa payment gateway including:
  - Payment initiation with hosted checkout
  - Transaction verification
  - Webhook handling for real-time status updates
- **Built dynamic pricing engine** that calculates booking costs based on stay duration
- **Created asynchronous email notifications** using Celery and Redis for payment and booking confirmations
- **Enforced data integrity** with database constraints, validators, and unique-together rules

#### DevOps Engineering

- **Containerized application** using Docker with multi-stage builds and health checks
- **Orchestrated services** with Docker Compose (web, db, redis, celery)
- **Automated CI/CD pipeline** with GitHub Actions:
  - Automated testing with PostgreSQL and Redis service containers
  - Code linting with Flake8
  - Docker image building and artifact management
  - SSH-based deployment to production servers
- **Configured Nginx** as reverse proxy with:
  - SSL/TLS encryption via Let's Encrypt
  - Static file serving with caching headers
  - Gzip compression
  - Upstream load balancing
- **Implemented health checks** at container and application levels
- **Managed secrets** securely via environment variables and GitHub Secrets

### Technical Implementation Highlights

| Component        | Technology            | Purpose                              |
| ---------------- | --------------------- | ------------------------------------ |
| API Framework    | Django REST Framework | RESTful endpoints with serialization |
| Documentation    | drf-yasg              | Swagger/OpenAPI auto-generation      |
| Database         | PostgreSQL            | Relational data with indexed queries |
| Task Queue       | Celery + Redis        | Async email processing               |
| Containerization | Docker                | Reproducible environments            |
| Orchestration    | Docker Compose        | Multi-service management             |
| CI/CD            | GitHub Actions        | Automated test, build, deploy        |
| Reverse Proxy    | Nginx                 | SSL, caching, load balancing         |
| WSGI Server      | Gunicorn              | Production-grade Python serving      |

### Code Quality Metrics

- **Clean Architecture**: Separation of concerns (models, views, serializers, tasks)
- **Database Optimization**: Indexed queries, efficient foreign key relationships
- **Error Handling**: Graceful degradation, proper HTTP status codes
- **Security**: CSRF protection, CORS configuration, secure headers

---

## Professional Strengths

✅ **System Design** – Architecting scalable, maintainable backend systems  
✅ **API Development** – Building well-documented, versioned REST APIs  
✅ **Database Design** – Modeling complex relationships with PostgreSQL  
✅ **DevOps Automation** – End-to-end CI/CD pipeline implementation  
✅ **Containerization** – Docker-first development and deployment  
✅ **Infrastructure** – Nginx configuration, SSL management, Linux administration  
✅ **Integration** – Third-party API integration (payments, webhooks)  
✅ **Problem Solving** – Debugging production issues, performance optimization

---

## What I Bring to Your Team

- **Production Experience**: Built and deployed real-world applications handling payments and user data
- **Full Stack Mindset**: Comfortable owning features from database design to deployment
- **Automation Focus**: Strong belief in CI/CD, infrastructure as code, and reducing manual processes
- **Documentation Culture**: APIs, code, and processes are only as good as their documentation
- **Continuous Learning**: Staying current with Python, Django, and DevOps best practices

---

## Let's Connect

I'm actively seeking opportunities as a **Senior Backend Engineer** or **DevOps Engineer** where I can contribute to building reliable, scalable systems.

📧 **Email**: ebunloigwilo@gmail.com
🔗 **Project Demo**: [https://travel.igwilo.com/swagger/](https://travel.igwilo.com/swagger/)  
📖 **API Documentation**: [https://travel.igwilo.com/redoc/](https://travel.igwilo.com/redoc/)

---

This profile is backed by a fully functional, deployed application. All code is available for review upon request.
