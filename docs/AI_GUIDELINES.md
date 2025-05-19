# AI Assistant Development Guidelines

## 1. Project Overview

This project is a web application designed to streamline tax accounting operations. The main objectives are as follows:

- Digitalization and efficiency improvement of tax accounting operations
- Centralized data management and improved accuracy
- Standardization of business processes and ensuring transparency
- Automation of report generation

## 2. Purpose of this Document

This document is created to achieve effective collaboration between the AI Assistant (hereinafter referred to as "Assistant") and developers. The main purposes are as follows:

- Establish guidelines for the Assistant to understand the project context and provide appropriate support
- Share consistent development policies and quality standards between developers and the Assistant
- Maximize the Assistant's capabilities to improve development efficiency
- Clarify standards for maintaining project quality and maintainability

This document serves as a basic guideline for the Assistant when supporting project development and will be updated and improved as needed.

### Notes on File Editing

When editing files within the project, including this document, the Assistant must strictly follow these steps:

1. Explain the overview of changes before proposing edits
2. Always request confirmation in "(y/n)" format before executing edits
3. Execute edits only when the user responds with "y"
4. Do not execute edits when the user responds with "n" or when there is no clear approval

This procedure prevents unintended changes and ensures clear communication with developers.

## 3. Development Environment

This project uses the following main technology stack:

### Frontend

- Next.js - React-based framework
- Redux - State management library
  - Used for application-wide state management
  - Responsible for sharing and managing global state

### Backend

- PostgreSQL - Relational database
- Prisma - ORM (Object-Relational Mapping)
  - Database operation abstraction
  - Provides type-safe database access
  - Migration management

## 4. Directory Structure

The main directories and their roles in the project are as follows:

### Application Code

- `app/` - Next.js application code
  - This directory should only contain Next.js core functionality (API routing, page routing)
  - Business logic should be placed in the `lib/` directory and called from `app/`
  - This improves reusability and maintainability of business logic
  - Page-specific components should be placed in the `components/` directory within each page directory
    - Example: Place dashboard-specific components in `app/dashboard/components/`
    - This makes it easier to manage page-specific components
- `components/` - Reusable React components
- `lib/` - Utility functions and common logic
  - `redux/` - Manages Redux store, actions, and reducers
  - `services/` - Places business logic called from API endpoints
  - `client/` - Type definitions and utility functions for frontend
- `hooks/` - Custom React hooks
- `styles/` - Global style definitions
- `public/` - Static files (images, etc.)

### Database Related

- `migrations/` - Database migration files
- `schema.prisma` - Prisma schema definition

### Testing Related

- `__tests__/` - Test files
- `seed/` - Test seed data

### Documentation

- `docs/` - Project documentation

### Others

- `bin/` - Management tools for database backup and user registration

This structure is clearly separated by functionality, improving code maintainability and readability. The Assistant should understand this structure and strive to place code in appropriate directories.

### New API Implementation Steps

1. Service Layer Implementation

   - Implement business logic in `lib/services/`
   - Include type definitions and validation

2. API Endpoint Implementation

   - Implement endpoints in `app/api/`
   - Call service layer functions

3. Redux Configuration

   - Define types and initial values for API responses in state
   - Implement async actions

4. Page Component Usage
   - Call async actions
   - Monitor state changes

## 5. Coding Standards

### Import Rules

- In import statements, do not use relative paths like `../xxx`, always use aliases (e.g., `@/lib/xxx`).
  - Reason: To improve readability and maintainability, and ensure safety during refactoring

### Notes on AI Editing

- When editing files, please note the following points considering formatter behavior:
  1. Unused import statements may be automatically removed by the formatter
  2. Keep temporarily unused import statements by commenting them out
  3. When adding or modifying multiple import statements, apply all changes at once
  4. Use comments like `// @ts-ignore` or `// eslint-disable-next-line` to suppress temporary warnings when necessary
