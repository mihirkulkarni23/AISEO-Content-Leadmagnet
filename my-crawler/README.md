# Web Content Crawler and Analyzer

A powerful web crawling and content analysis tool built with Crawlee and Playwright. This tool helps you extract, analyze, and generate content ideas from websites.

## Features

- 🔍 **Web Crawling**: Extract internal links from websites
- 📝 **Content Extraction**: Clean and structured content scraping
- 🔑 **Keyword Analysis**: Process and analyze keywords from content
- 💡 **Content Ideas**: Generate content ideas and headlines based on keywords
- 📊 **Data Processing**: Handle multiple content sources and generate CSV reports
- 🛡️ **Robust Error Handling**: Comprehensive error handling and retry mechanisms
- ⚡ **Performance Optimized**: Configurable concurrency and rate limiting

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Git

## Installation

1. Clone the repository:
```bash
git clone <your-repository-url>
cd my-crawler
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create a `.env` file in the root directory (if needed):
```env
# Add your environment variables here
```

## Project Structure

```
my-crawler/
├── src/
│   ├── controllers/     # Request handlers and API endpoints
│   ├── handlers/        # Core crawling and processing logic
│   ├── services/        # Business logic and external services
│   └── routes.js        # API route definitions
├── storage/            # Crawlee storage directory (gitignored)
└── package.json
```

## Usage

### API Endpoints

1. **Get Internal Links**
```bash
POST /api/internal-links
Body: { "url": "https://example.com" }
```

2. **Get Website Content**
```bash
POST /api/website-content
Body: { "urls": ["https://example.com"] }
```

3. **Process Keywords**
```bash
POST /api/process-keywords
Body: { "csvInput": "keyword1,keyword2" }
```

4. **Get Content Ideas**
```bash
POST /api/content-ideas
Body: { "keyword": "your keyword" }
```

### Configuration

The crawler can be configured through various parameters in the handlers:

- `MAX_DEPTH`: Maximum crawl depth (default: 2)
- `MAX_PAGES`: Maximum pages to crawl (default: 10)
- `MAX_CONCURRENCY`: Concurrent requests (default: 5)
- `MAX_REQUESTS_PER_MINUTE`: Rate limiting (default: 50)

## Development

1. Start the development server:
```bash
npm run dev
# or
yarn dev
```

2. Run tests:
```bash
npm test
# or
yarn test
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Crawlee](https://crawlee.dev/) - Web scraping and browser automation library
- [Playwright](https://playwright.dev/) - Browser automation framework

## Support

For support, please open an issue in the GitHub repository or contact the maintainers.
