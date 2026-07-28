# Security Policy

## Supported version

Security fixes are applied to the latest version on the main branch.

## Reporting

Do not open a public issue for a vulnerability involving credentials, authentication, or data exposure. Contact the repository owner privately with reproduction steps and affected files.

## Deployment checklist

- Rotate any credential that has ever appeared in Git history.
- Configure a long random `INGEST_API_KEY` in the deployment environment.
- Restrict MongoDB Atlas network access and database-user permissions.
- Use HTTPS for the ESP32 API endpoint.
- Keep `.env.local` and `firmware/config.h` out of source control.
- Add per-device authentication and replay protection before operating multiple devices.
- Treat SmartPipeX as a monitoring aid, not a certified safety controller.
