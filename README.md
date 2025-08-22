# Kim Family Project

This is a Next.js 14 project named "kim-family" that features a trivia generator, a family site, and a rock climbing game. The project is built with TypeScript, Tailwind CSS, and includes PWA support, a Supabase client, and an OpenAI-powered trivia API route.

## Features

1. **Home Page**: A landing page with three cards linking to:
   - Trivia Generator
   - Kim Family Site
   - Rock Climber Game

2. **Trivia Page**: A form to generate trivia questions based on selected fandom and difficulty, with results displayed in a collapsible list.

3. **API Route**: A server-side route that interacts with the OpenAI API to fetch trivia questions.

4. **Supabase Integration**: Allows saving trivia sets and questions to a Supabase database.

5. **Rock Climber Game**: A simple physics-based game built with Kaboom.js.

6. **About Page**: Displays family information with editable cards for each child, sourced from a local JSON file.

## Getting Started

### Prerequisites

- Node.js (version 14 or later)
- npm or yarn

### Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd kim-family
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env` and fill in the required values:
     ```
     OPENAI_API_KEY=your_openai_api_key
     NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
     ```

### Running the Project

To start the development server, run:
```
npm run dev
```
Open your browser and navigate to `http://localhost:3000`.

### Building for Production

To build the project for production, run:
```
npm run build
```

### Adding to Home Screen (iPad)

For a better experience on iPad, you can add the app to your home screen. Open Safari, navigate to the app, and select "Add to Home Screen" from the share menu.

## License

This project is licensed under the MIT License. See the LICENSE file for details.