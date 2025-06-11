# Billy

Billy is a simple bill tracking application with a Node.js/Express backend and a React frontend. It lets you record recurring bills, group them by pay period and mark payments as completed. The backend stores bill information in a lightweight SQLite database.

## Prerequisites

- [Node.js](https://nodejs.org/) and npm

## Installation

Install dependencies for both the backend and frontend:

```bash
npm run install-all
```

## Running the app

Start the backend API and the React client concurrently:

```bash
npm start
```

The API listens on port `7864` by default and the React development server runs on port `3000`. The frontend reads the API base URL from `frontend/baseurl.env` which defaults to `http://localhost:7864`.

## Building for production

```bash
npm run build
```

This creates the production build of the React app in `frontend/build`.

## Docker deployment

Build the Docker image:

```bash
docker build -t billy .
```

Run the container while publishing the port and optionally setting the time zone:

```bash
docker run -p 7864:7864 \
  -e PORT=7864 \
  -e TZ=America/New_York \
  billy
```

Available environment variables:

- `PORT` - Port the Express server listens on (default `7864`).
- `TZ` - Time zone used by the container (default `UTC`).

## Running tests

### Backend

```bash
cd backend
npm test
```

### Frontend

```bash
cd frontend
npm test -- --watchAll=false
```

## Database

The backend uses a SQLite database stored at `backend/data/bills.db` by default. A sample JSON file is provided at `backend/data/bills_example.json` to illustrate the bill format.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

