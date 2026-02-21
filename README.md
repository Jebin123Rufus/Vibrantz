# ArchitectAI - Project Blueprint Generator

An advanced AI Project Architect that converts project ideas into complete, structured, execution-ready architecture blueprints.

## 🚀 Built With
- **Frontend**: React, TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Backend**: Node.js, Express, MongoDB, Mongoose
- **AI**: Groq SDK (Llama 3.3 70B)

## 🛠️ Getting Started

### Prerequisites
- Node.js & npm
- MongoDB Atlas account (or local MongoDB instance)
- Groq API Key

### Installation

1. Clone the repository
2. Install dependencies:
   ```sh
   npm install
   ```
3. Set up environment variables in `.env`:
   ```env
   VITE_GROQ_API_KEY="your_groq_api_key"
   MONGODB_URI="your_mongodb_uri"
   JWT_SECRET="your_jwt_secret"
   PORT=5000
   ```

### Running the Application

1. Start the Backend:
   ```sh
   npm run server
   ```

2. Start the Frontend (Vite):
   ```sh
   npm run dev
   ```

## 📄 License
MIT
