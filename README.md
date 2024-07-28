# NestJS CRUD Auth API

<div align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</div>

<p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>

<p align="center">
  <a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
  <a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
  <a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
  <a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
  <a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
  <a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
  <a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
</p>

## 📚 Description

This project is a simple REST API built with [NestJS](https://github.com/nestjs/nest), Prisma ORM, and MySQL. It includes user authentication with JWT and CRUD operations for Example blog posts.

## 🏗️ Project Structure

This project follows the module-based architecture pattern commonly used in NestJS applications:

1. **Modularity**: Each feature (auth, posts and comments) is encapsulated in its own module.
2. **Separation of Concerns**: Controllers handle HTTP requests, services contain business logic, and the Prisma service manages database operations.
3. **Scalability**: New features can be easily added as separate modules.
4. **Testability**: The modular structure facilitates writing unit tests and e2e tests.
5. **Dependency Injection**: NestJS's built-in DI container manages dependencies between modules and services.

## 🚀 Setup and Running

1. Install dependencies:
   ```bash
   npm install
   ```
2. Set up your MySQL database and update the `.env` file with your database URL.
3. Run database migrations:
   ```bash
   npx prisma migrate dev
   ```
4. Start the server:
   ```bash
   npm run start:dev
   ```

## 🧪 Testing

Run e2e tests:
```bash
npm run test:e2e
```

## 📘 API Documentation

API documentation is available via Postman. Import the provided [Postman collection](https://raw.githubusercontent.com/YogaNovvaindra/Example-NestJs/main/postman/Example-NestJs.json) to see available endpoints and example requests.

## 🛠️ Installation

```bash
npm install
```

## 🏃‍♂️ Running the app

```bash
# development
npm run start

# watch mode
npm run start:dev

# production mode
npm run start:prod
```

## 🧪 Test

```bash
# unit tests
npm run test

# e2e tests
npm run test:e2e

# test coverage
npm run test:cov
```

## 🤝 Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## 📄 License

Nest is [MIT licensed](LICENSE).
