# Local college system

The website is the college information and admissions hub. The college API stores applications, accounts, and registrations in MySQL. Moodle is a separate learning platform with account and course enrolment synchronisation from the administrator workspace.

## This prepared PC

Use Start-College-Local.cmd in this project folder, or Start-Sepo-College.cmd in its parent outputs folder. Launch it from File Explorer or a normal Windows terminal. Keep the window open.

The first run creates college tables, seeds the programme catalogue, runs workflow tests, installs Moodle, and configures the local integration. This can take several minutes. A setup failure is shown in the terminal; it does not mean installation completed.

The prepared runtime is outside the project in the chat workspace's work/local-services folder. It uses the installed MySQL 8.0 binary and XAMPP PHP 8.2 with a separate project PHP configuration. It does not import or overwrite existing databases.

Addresses after successful startup:

- Website: http://localhost:5181
- College administrator: http://localhost:5181/administration
- Student portal: http://localhost:5181/student-portal
- Moodle: http://localhost:8088
- College API health: http://localhost:5000/api/health

Private administrator credentials are in Sepo-College-Local-Access.txt in the outputs folder. Keep that file private.

## Admissions and registration

1. Submit an application through the website's student kiosk.
2. Save the reference. Checking status also requires the application email.
3. Sign in to the administrator workspace and review the application.
4. Accept it to create a student account. Repeating acceptance does not create another account.
5. Deliver the displayed temporary credentials privately to the student.
6. The student signs in to the student portal and replaces the temporary password.
7. The student selects courses and saves registration.
8. The administrator opens Students and selects Create Moodle account or Update Moodle enrolments.
9. On first creation, separate Moodle temporary credentials appear once. Deliver them privately.
10. The student signs in to Moodle and changes that temporary password when prompted.

College registration records persist in sepo_college_local. Moodle learning data persists separately in sepo_moodle_local and the runtime's moodledata directory.

Acceptance does not claim that an email was delivered. SMTP delivery is not configured.

## Moodle teaching

Use the Moodle administrator account to add lecturers, assign teaching roles, add learning materials and assignments, and manage course settings. The integration creates Moodle course shells for registered courses; teaching content must be added by the college.

The integration uses a private REST token restricted to the local machine and five account/course/enrolment functions. React does not receive the token or collect Moodle passwords.

The launcher runs Moodle's scheduled task runner while it is open. Keep the launcher open for services and scheduled tasks to continue.

## Verification

Backend syntax and frontend builds can be checked without a database. Run npm test in backend to check real database persistence, approval idempotence, access restrictions, password replacement, and registration rollback/deduplication. The launcher runs these database checks before starting Moodle.

Successful compilation alone does not verify the database or Moodle. Complete setup and the workflow above in a normal Windows session.

## Other PCs and online hosting

The clean source ZIP excludes databases, Moodle runtime files, installed dependencies, private environment files, and credentials. Its launcher expects this prepared runtime; it is not a self-contained Moodle installer for another PC.

Before public hosting, configure supported servers, HTTPS, production secrets, backups, and email delivery, then retest the complete workflow. Localhost addresses are for this PC.
