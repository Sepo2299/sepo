# Sepo College of Science and Innovation

A college information and marketing website with a restrained navy, gold, and warm-white identity drawn from the college logo. School colours remain blue (Science), green (Computers), red (Automotive), and purple (Entertainment).

## Local database and Moodle setup

The project now includes a database-backed admissions and student portal, administrator application review, account creation, course registration, and Moodle synchronisation. See LOCAL-SETUP.md for the prepared-PC launcher and verification workflow. Moodle setup must complete before learning accounts and courses can be synchronised.

## Website

The React website includes a homepage, college introduction, four school pages, a searchable catalogue of 26 programmes, admissions guidance, a student application form, and contact information. The e-Learning page leads to Moodle once its address is configured. Moodle handles teaching, course materials, assignments, and learning accounts separately.

## Run locally

Requires Node.js 22 and npm.

1. Open a terminal in frontend.
2. Run npm ci.
3. Run npm run dev.
4. Open http://localhost:5180.

Run npm run build to create frontend/dist. Run npm run preview to inspect the production build.

## Moodle

Moodle has not been set up yet. The website displays a coming-soon state and does not collect Moodle passwords. When Moodle is ready, create frontend/.env from .env.example and set VITE_MOODLE_URL to its HTTPS address. Rebuild or restart the frontend. This is a direct link to Moodle, not single sign-on or automatic enrolment. See MOODLE-SETUP.md.

## Admissions service

The original Express/MySQL backend is retained in backend. The website uses /api during development, proxied to http://127.0.0.1:5000. The original database schema is in database/sepocollege.sql. Original environment credentials and uploads are not included in the rebuilt package.

To run the backend, install its dependencies with npm ci, configure MySQL and a backend/.env using .env.example, and run npm start. Import a clean schema into a development database; review the supplied SQL before importing it.

For a hosted admissions service, set VITE_API_BASE_URL to the HTTPS API address ending in /api and permit the website origin in the backend CORS settings. A production build without that setting disables application submission and status checks, and clearly labels the design preview.

Application submission and status checks use the existing API contract. They have not been verified against a configured MySQL server in this rebuild. Registration and official document requests are directed to student services instead of showing simulated success.

## Content and assets

Programme names, durations, requirements, and department email addresses come from the supplied project. Confirm current catalogue details and contact addresses before public launch. Placeholder leadership, accreditation claims, statistics, phone numbers, street addresses, and expired announcements are not used in the new public pages.

The supplied college logo is included unchanged. Illustrative photography loads from Unsplash; it does not represent verified Sepo College campus photographs. Typography uses DM Sans and Libre Caslon Display from Google Fonts, with local fallback fonts.

## Tools

React 18, React Router, Vite, Tailwind CSS, React Icons, and standard CSS. The retained backend uses Node.js, Express, MySQL, bcrypt, JWT, and Nodemailer.
"# sepo" 
