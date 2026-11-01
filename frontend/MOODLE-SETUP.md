# Moodle connection

The college website is the public information and admissions hub. Moodle is a separate learning platform; it is not installed by the website.

## When Moodle is ready

1. Obtain the college's working HTTPS Moodle address.
2. Set VITE_MOODLE_URL in frontend/.env to that address.
3. Rebuild with npm run build and deploy the updated frontend.
4. Open the website's e-Learning page and verify that Open Moodle leads to the correct college platform.
5. Test with a student account created in Moodle.

Moodle owns passwords, account creation, course enrolment, permissions, and learning records. This website does not proxy Moodle sign-in, store its passwords, or need a Moodle API token for a simple link. Single sign-on and automated enrolment are separate future integrations.

Until a valid HTTPS address is configured, the page displays Moodle access is coming soon.
