# MindAlign-FrontEnd
Mind Align - Planner Digital (front-end)

## API configuration

Set `NEXT_PUBLIC_API_URL` to the backend base URL when deploying the frontend.
Local development defaults to `http://localhost:3333`; production defaults to
`https://mind-align-backend.onrender.com`.
Production ignores a localhost API URL so a local-only setting cannot break the
deployed app.

The backend accepts `http://localhost:3000` and
`https://mind-align.vercel.app` by default. Set `FRONTEND_URL` on the backend
to the deployed frontend origin when using a different production domain.
