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

Run the container while publishing the port, optionally setting the time zone,
and mapping a host directory for persistent data:

```bash
docker run -p 7864:7864 \
  -e PORT=7864 \
  -e TZ=America/New_York \
  -e UID=$(id -u) \
  -e GID=$(id -g) \
  -v $(pwd)/data:/app/backend/data \
  billy
```

This mounts the host `./data` directory to `/app/backend/data` inside the
container so the SQLite database and any other files placed there survive
container restarts.

Available environment variables:

- `PORT` - Port the Express server listens on (default `7864`).
- `TZ` - Time zone used by the container (default `UTC`).
- `UID` - UID for the `billy` user created at runtime (default `1000`).
- `GID` - GID for the `billy` group created at runtime (default `1000`).

### Docker Compose example

```yaml
version: '3'
services:
  billy:
    build: .
    ports:
      - "7864:7864"
    environment:
      - TZ=America/New_York
      - UID=${UID:-1000}
      - GID=${GID:-1000}
    volumes:
      - ./data:/app/backend/data
```

## Running tests

You can run both the backend and frontend test suites from the project root:

```bash
npm test
```

To run them individually:

```bash
cd backend && npm test
cd ../frontend && npm test -- --watchAll=false
```

## Database

The backend uses a SQLite database stored at `backend/data/bills.db` by default. A sample JSON file is provided at `backend/data/bills_example.json` to illustrate the bill format.

## Versioning

This project follows [Semantic Versioning](https://semver.org/). The patch number
is automatically incremented whenever commits land on the `main` branch. Our
container publish workflow builds the Docker image, tags it with the new version
and `latest`, verifies the digests match, then pushes the release commit and tag
back to the repository.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file
for details.

