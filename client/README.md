# Lead Magnet - Internal Links Crawler

A React application that crawls websites to analyze internal links, extract keywords, and generate content ideas.

## Features

- Internal links crawling and analysis
- Website content extraction
- Keyword analysis and expansion
- Content ideas generation
- Modern UI with Tailwind CSS

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn

## Installation

1. Clone the repository
2. Navigate to the client directory:
   ```bash
   cd client
   ```
3. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```
4. Create a `.env` file in the client directory with the following content:
   ```
   VITE_API_BASE_URL=http://localhost:3000/api/crawler
   ```

## Development

To start the development server:

```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:5173`

## Building for Production

To create a production build:

```bash
npm run build
# or
yarn build
```

The build output will be in the `dist` directory.

## Project Structure

```
client/
├── src/
│   ├── components/
│   │   ├── crawler/
│   │   │   ├── HeadlinesDisplay.jsx
│   │   │   ├── InternalLinksList.jsx
│   │   │   ├── KeywordsTable.jsx
│   │   │   ├── UrlInputForm.jsx
│   │   │   └── WebsiteContent.jsx
│   │   └── InternalLinksCrawler.jsx
│   ├── services/
│   │   └── crawlerService.js
│   ├── assets/
│   ├── App.jsx
│   └── main.jsx
├── public/
├── .env
├── .gitignore
├── package.json
└── README.md
```

## API Endpoints

The application communicates with the following API endpoints:

- `POST /api/crawler/internal-links` - Get internal links from a URL
- `POST /api/crawler/website-content` - Get content from multiple URLs
- `POST /api/crawler/keywords` - Extract keywords from content
- `POST /api/crawler/new-keywords` - Expand keywords
- `POST /api/crawler/content-ideas` - Generate content ideas
- `POST /api/crawler/process-expanded-keywords` - Process expanded keywords

## Technologies Used

- React
- Vite
- Tailwind CSS
- Fetch API

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
