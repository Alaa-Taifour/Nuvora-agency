# Project Folder Structure

## Overview
This document outlines the organization of the project folders, the purpose of each file, naming conventions, and best practices for maintaining the code structure of the Nuvora Agency project.

## Folder Structure

```
Nuvora-agency/
├── src/
│   ├── components/
│   ├── assets/
│   ├── styles/
│   └── index.js
├── public/
├── tests/
├── docs/
└── package.json
```

### 1. `src/`
This is the main source code folder.
- **components/**: Contains all reusable components. Each component should have its own subfolder containing its files (e.g., `.js`, `.css`, etc.).
- **assets/**: This folder holds all images, fonts, and other media assets used in the project.
- **styles/**: Contains global styles and theme files.
- **index.js**: The entry point of the application.

### 2. `public/`
This directory contains static files that get served directly. For example, the `index.html` file and any other static assets.

### 3. `tests/`
All test files should reside in this directory. Each component should have a corresponding test file, using the same structure as the `src` folder for ease of navigation.

### 4. `docs/`
This folder contains documentation related to the project, including setup instructions and usage guides.

### 5. `package.json`
This file manages project dependencies, scripts, and metadata.

## Naming Conventions
- Use `camelCase` for JavaScript variables and functions. For example, `myVariable`, `calculateTotal()`.
- Use `PascalCase` for React components. For example, `MyComponent`.
- Use `kebab-case` for file names. For example, `my-component.js`, `style.css`.

## Best Practices
1. **Consistent Structure**: Maintain a consistent folder structure across all components to enhance readability.
2. **Comments**: Write clear comments and documentation inside your code to make it easier for others to understand.
3. **Keep It Clean**: Regularly refactor code to remove unused files and simplify complex components.
4. **Version Control**: Always commit your changes with meaningful commit messages to track the evolution of the project effectively. 
5. **Collaboration**: Follow a standardized approach when collaborating with others, including code reviews and maintaining design decisions documented.

Following these guidelines helps to ensure that our project remains organized, scalable, and easier to manage over time.