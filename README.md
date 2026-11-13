# ISKOLAR MARSU

A responsive scholarship portal built with plain HTML, CSS, and JavaScript for static hosting on GitHub Pages.

The header displays the Marinduque State University seal from the university's official website and needs an internet connection to load.

## Publish on GitHub Pages

1. Push `index.html`, `styles.css`, and `app.js` to a GitHub repository.
2. In **Settings → Pages**, select the branch and folder containing `index.html`.
3. Open the published Pages URL. No build step or dependencies are required.

## Demo staff account

- Email: `staff@marsu.edu.ph`
- Password: `MarsuStaff2026!`

The staff credentials are intentionally visible in the client-side demo. This is not a secure production authentication system.

## Storage and production use

Student accounts, applications, decisions, and the active login session are stored in the browser's local storage. They persist in that browser and update across tabs on the same origin; a static GitHub Pages deployment has no server or shared database, so different browsers/devices do **not** share submissions or status updates. This demo stores passwords in browser storage and must not be used for real credentials or sensitive personal information.

For production, connect the interface to a backend with managed authentication, authorization, secure password storage, and a shared database before collecting real applicant data.
