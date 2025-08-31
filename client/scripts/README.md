# updateDashboardStats.js

This script computes aggregate dashboard statistics from Firestore and writes them to the `dashboard/stats` document.

Why

- Keeps client rules tight by letting the client read a single aggregated document instead of performing broad collection reads.

Required environment variables (set in `.env.local` or `.env` in the project root):

- FIREBASE_ADMIN_PROJECT_ID
- FIREBASE_ADMIN_CLIENT_EMAIL
- FIREBASE_ADMIN_PRIVATE_KEY (escape newlines as `\n`)
- (Optional) NEXT_PUBLIC_FIREBASE_PROJECT_ID

Run locally

```bash
# from project root
npm run update:dashboard
```

Notes

- The script uses the Firebase Admin SDK and requires a service account via environment variables.
- You can run this script on a schedule (cron) or hook it to write on writes via a Cloud Function.
