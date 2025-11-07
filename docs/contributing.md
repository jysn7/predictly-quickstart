# Contributing

Thank you for considering contributing to Predictly! This document provides guidelines and instructions for contributing to the project.

## Getting Started

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/predictly-quickstart.git
   cd predictly-quickstart
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Create a branch:
   ```bash
   git checkout -b feature/amazing-feature
   ```

## Development Setup

1. Copy environment file:
   ```bash
   cp .env.example .env.local
   ```

2. Configure environment:
   ```bash
   # Required for authentication
   NEXT_PUBLIC_URL=http://localhost:3000

   # For development, enable demo mode
   NEXT_PUBLIC_USE_STATIC_DEMO=true

   # Optional: add OpenAI key for AI features
   OPENAI_API_KEY=your_key_here
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

## Code Style

We use ESLint and Prettier for code formatting. Enable format-on-save in your editor for the best experience.

### TypeScript
- Use TypeScript for all new code
- Define interfaces for data structures
- Use strict mode
- Add JSDoc comments for complex functions

### CSS
- Use CSS Modules for component styles
- Follow BEM-like naming in global.css
- Use CSS variables for theming
- Mobile-first responsive design

### Components
- One component per file
- Use functional components
- Implement proper prop types
- Add loading states
- Handle errors gracefully

## Testing

Run tests before submitting PRs:

```bash
# Run all tests
npm test

# Run specific test
npm test -- -t "test name"

# Watch mode
npm test -- --watch
```

## Pull Request Process

1. Update documentation
2. Add/update tests
3. Ensure all tests pass
4. Update the changelog
5. Submit PR with clear description

### PR Title Format
- feat: Add new feature
- fix: Bug fix
- docs: Documentation changes
- style: Code style updates
- refactor: Code refactoring
- test: Add/update tests
- chore: Tooling, dependencies

## Local Development Tips

### Working with APIs
```typescript
// Use demo mode for development
const useMock = process.env.NEXT_PUBLIC_USE_STATIC_DEMO === 'true';

// Example API call
async function getData() {
  if (useMock) {
    return mockData;
  }
  // Real API call
}
```

### Debug Logging
```typescript
// Enable debug mode
const debug = process.env.NODE_ENV === 'development';

if (debug) {
  console.log('Debug info');
}
```

## Directory Structure

```
predictly-quickstart/
├── app/
│   ├── api/          # API routes
│   ├── components/   # React components
│   ├── hooks/        # Custom hooks
│   ├── utils/        # Utility functions
│   └── ...          # Page components
├── docs/            # Documentation
├── public/          # Static assets
├── tests/           # Test files
└── package.json     # Dependencies
```

## Common Tasks

### Adding a New Feature

1. Create feature branch
2. Add new components/APIs
3. Update tests
4. Document changes
5. Submit PR

### Fixing a Bug

1. Create bug-fix branch
2. Add failing test
3. Fix the bug
4. Verify tests pass
5. Submit PR

### Updating Dependencies

1. Check for updates:
   ```bash
   npm outdated
   ```
2. Update packages:
   ```bash
   npm update
   ```
3. Test thoroughly
4. Submit PR

## Documentation

- Update README.md for high-level changes
- Update /docs for detailed documentation
- Include code examples
- Add screenshots if relevant

## Release Process

1. Update version in package.json
2. Update CHANGELOG.md
3. Create release PR
4. Tag release after merge
5. Deploy to production

## Getting Help

- Check existing issues
- Join discussions
- Ask in Discord
- Review documentation

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers
- Focus on constructive feedback
- Follow project guidelines

## Recognition

Contributors are listed in:
- README.md
- GitHub contributors
- Release notes

## License

By contributing, you agree that your contributions will be licensed under the MIT License.