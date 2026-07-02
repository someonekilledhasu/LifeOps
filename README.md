# 🚀 LifeOps

> **The AI that handles the annoying decisions you make every day.**

LifeOps is an AI-powered everyday life workspace that simplifies daily decision-making. Whether you're deciding what to eat, managing expenses, drafting difficult messages, or tracking personal habits, LifeOps brings everything together in one clean and intuitive interface.

---

## ✨ Features

### 🍽️ Smart Food Decider

* AI-powered meal recommendations
* Budget-aware suggestions
* Diet & health preferences
* Cuisine and mood filters
* Time-based recommendations
* Food history
* Intelligent fallback suggestions

### 💰 Expense Analyzer

* CSV bank statement import
* Automatic merchant categorization
* Expense CRUD operations
* Search and advanced filters
* Spending analytics
* Charts & insights
* CSV export

### ✉️ AI Message Generator

* Generate difficult messages instantly
* Multiple tone options
* Recipient-specific responses
* Editable AI suggestions
* Copy & regenerate
* Save message history
* Download as text

### 📊 Adulting Score

Track your daily productivity using:

* Budget awareness
* Spending habits
* Tracking consistency
* Food variety
* Overall activity patterns

### ⚙️ Personal Settings

* Monthly budget
* Preferred currency
* Food preferences
* Profile settings
* Dark Mode support

---

## 🌐 Live Demo

**Try LifeOps here:**

https://lifeops-three.vercel.app/

---

## 🛠 Tech Stack

### Frontend

* Next.js 15 (App Router)
* React
* TypeScript
* Tailwind CSS
* Framer Motion
* Recharts
* Lucide Icons

### Backend

* Next.js API Routes
* Prisma ORM
* PostgreSQL

### AI

* OpenAI API
* Google Gemini API

### Validation & Forms

* React Hook Form
* Zod

---

# 🚀 Getting Started

## 1. Clone the repository

```bash
git clone https://github.com/someonekilledhasu/LifeOps.git

cd LifeOps
```

---

## 2. Install dependencies

```bash
npm install
```

---

## 3. Configure Environment Variables

Create a `.env` file from `.env.example`.

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/lifeops?schema=public"

OPENAI_API_KEY=""

GEMINI_API_KEY=""
```

You only need **one AI provider**.

If neither key is configured, LifeOps will automatically use curated fallback responses.

---

## 4. Generate Prisma Client

```bash
npm run db:generate
```

---

## 5. Push Database Schema

```bash
npm run db:push
```

Or create migrations:

```bash
npm run db:migrate -- --name init
```

---

## 6. Run Development Server

```bash
npm run dev
```

Open

```
http://localhost:3000
```

---

# 📁 Project Structure

```text
prisma/
└── schema.prisma

src/
├── app/
│   ├── (workspace)
│   └── api/
├── components/
├── lib/
└── styles/
```

---

# 📦 API Routes

| Route                    | Methods       | Description               |
| ------------------------ | ------------- | ------------------------- |
| `/api/food/suggestions`  | POST          | Generate food suggestions |
| `/api/expenses`          | GET, POST     | Manage expenses           |
| `/api/expenses/[id]`     | PATCH, DELETE | Update/Delete expense     |
| `/api/expenses/upload`   | POST          | Import CSV                |
| `/api/insights/spending` | GET           | Spending analytics        |
| `/api/reports/expenses`  | GET           | Export report             |
| `/api/messages/generate` | POST          | Generate AI messages      |
| `/api/messages`          | GET, POST     | Save & retrieve messages  |
| `/api/score`             | GET           | Adulting Score            |
| `/api/settings`          | GET, PUT      | User settings             |

---

# 📈 Roadmap

* User authentication
* Persistent cloud workspaces
* AI background CSV processing
* Category budgets
* Multi-currency support
* Weekly email reports
* Push notifications
* Better analytics
* Improved accessibility
* More AI integrations

---

# 🤝 Contributing

Contributions are always welcome!

Please read **CONTRIBUTING.md** before opening an issue or submitting a Pull Request.

If you have an idea for a feature or improvement, feel free to open an Issue first for discussion.

---

# ⭐ Support

If you find this project useful:

* ⭐ Star the repository
* 🍴 Fork it
* 🛠️ Contribute
* 📢 Share it with others

Every contribution helps make LifeOps better.

---

# 📄 License

This project is licensed under the **MIT License**.
