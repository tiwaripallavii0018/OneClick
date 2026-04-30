# 🚀 Vercel Clone — Custom Deployment Platform

A simplified **Vercel-like deployment platform** that builds and serves frontend applications directly from GitHub repositories using a distributed architecture.

---

## ✨ Features

* 🔗 Deploy apps using a GitHub repository URL
* ⚙️ Background build system powered by Redis (job queue)
* ☁️ Object storage using Cloudflare R2 (S3-compatible)
* 🛠️ Automated build pipeline (`npm install` + `npm run build`)
* 🌐 Dynamic static file serving via request handler
* 📊 Real-time deployment status tracking

---

## 🏗️ Architecture Overview

```
User / Client
      │
      ▼
Upload Server (Port 3000)
      ├── Clone repository
      ├── Upload source files to R2
      └── Push job → Redis
                │
                ▼
             Redis (Queue)
                │
                ▼
Deploy Server (Worker)
      ├── Download source from R2
      ├── Install dependencies
      ├── Build project
      ├── Upload dist/ to R2
      └── Update deployment status
                │
                ▼
Request Handler (Port 3001)
      ├── Resolve deployment ID
      ├── Fetch files from R2
      └── Serve response
                │
                ▼
              Browser
```

---

## 🧠 How It Works

1. User submits a GitHub repository URL
2. Upload server clones the repo and uploads files to R2
3. A job is pushed into Redis queue
4. Worker picks the job and builds the project
5. Build output (`dist/`) is uploaded to R2
6. Request handler serves files dynamically

---

## 🛠️ Tech Stack

* **Backend:** Node.js, TypeScript
* **Queue System:** Redis
* **Storage:** Cloudflare R2
* **Infrastructure:** Distributed microservices

---

## ⚙️ Setup & Installation

```bash
# Clone repository
git clone <your-repo-url>

# Install dependencies
npm install

# Start Upload Server
npm run start:upload

# Start Worker (Deploy Server)
npm run start:worker

# Start Request Handler
npm run start:serve
```

---

## 📌 Environment Variables

Create a `.env` file and configure:

```
REDIS_URL=
R2_ACCESS_KEY=
R2_SECRET_KEY=
R2_BUCKET_NAME=
```

---

## 🚧 Future Improvements

* 🔐 Authentication & user accounts
* 📦 Support for multiple frameworks (Next.js, React, Vue)
* 🌍 Custom domains
* 📈 Deployment logs & monitoring dashboard
* ⚡ CI/CD pipeline integration

---

## 💡 Inspiration

Inspired by platforms like Vercel, Netlify, and modern cloud deployment systems.
