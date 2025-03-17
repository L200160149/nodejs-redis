# 🚀 Basic Usage of Redis on Node.js

This project demonstrates how to integrate Redis with a Node.js application.

---

## 🔧 Prisma Commands

### 📌 Generate Migrations & Seed Users Table

Run the following commands to initialize the database and seed the `users` table:

```sh
npx prisma migrate dev --name dev
npx ts-node prisma/seeder/users.ts
```
