# GitHub PR Assistant

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-4285F4?style=for-the-badge&logo=google-chrome&logoColor=white)

A Chrome extension that helps with pull request reviews by providing AI-powered suggestions and comments on GitHub pull requests.

## Features

- **AI-Powered Suggestions**: Get intelligent suggestions for pull request reviews
- **Comment Generation**: Automatically generate review comments based on code changes
- **GitHub Integration**: Seamlessly integrates with GitHub PR pages
- **Browser Extension**: Works directly in your browser when viewing pull requests
- **Settings Management**: Configure your GitHub token and preferences

## Tech Stack

- **Framework**: Next.js 15
- **Language**: TypeScript
- **UI**: React 19, Tailwind CSS
- **Extension**: Chrome Extension Manifest V3
- **Build**: esbuild for content scripts

## Installation

### From Source

1. Clone the repository:
```bash
git clone https://github.com/arthur-zhuk/github-pr-assistant.git
cd github-pr-assistant
```

2. Install dependencies:
```bash
npm install
```

3. Build the extension:
```bash
npm run build
```

4. Load the extension in Chrome:
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `github-pr-assistant` directory

### Configuration

1. After installing, click the extension icon
2. Enter your GitHub Personal Access Token in the settings
3. The extension will now work on GitHub pull request pages

## Usage

1. Navigate to any GitHub pull request page
2. The extension will automatically detect the PR
3. Click the extension icon to view suggestions
4. Use the suggestions to improve your code review process

## Development

```bash
npm run dev        # Start Next.js dev server with Turbopack
npm run build      # Build extension and styles
npm run lint       # Run ESLint
```

### Project Structure

```
github-pr-assistant/
├── app/
│   ├── api/           # API routes for suggestions
│   └── extension/     # Extension pages
├── components/        # React components
├── dist/             # Built extension files
├── manifest.json     # Chrome extension manifest
└── content.jsx       # Content script for GitHub pages
```

## Building for Production

```bash
npm run build
```

The built extension files will be in the `dist/` directory. You can package this directory as a Chrome extension.

## License

MIT
