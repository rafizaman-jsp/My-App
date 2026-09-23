Hospital Appointment System

1. Purpose

This is the permanent engineering instruction for this project.

The project is a partially completed university-level Hospital Appointment System for a BSc in CSE project.

The job is to finish, stabilize, and verify the existing project according to the approved requirements, reference hospital application, and final database schema.

Implement first. Explain afterward.

Do not expand the project scope unless the user explicitly asks.

2. NON-NEGOTIABLE RULES

This is a half-complete project. Do NOT rebuild it from scratch.

Inspect existing code before changing it.

Preserve working functionality.

Do not introduce unrelated features.

Treat the final database schema as locked.

Do not add new tables, fields, or relationships unless explicitly requested.

Do not migrate frameworks without a real requirement.

Preserve the existing Expo + React Native architecture.

Preserve the existing React Navigation architecture unless explicitly requested otherwise.

Keep one shared application for iOS, Android, and Web.

Do not create a duplicate backend inside this repository.

The authoritative backend is external to this frontend repository.

If backend changes are required, inspect and modify the authoritative external backend.

After backend changes, restart/reload the external backend when necessary and verify it.

Never claim a backend was restarted or tested if it could not actually be done.

Never expose passwords, database credentials, API secrets, or environment values.

Do not silently replace existing business rules with invented rules.

If requirements conflict, prefer the explicit current user requirement and final schema; otherwise preserve existing/reference behavior and report the conflict.

3. LOCKED PROJECT SCOPE

The approved scope is the Hospital Appointment System.

Patient:

Registration

Login/logout

Profile

View doctors and specialization

View doctor availability

Select appointment date

View available time slots

Book appointment

View own appointments

Change appointment time where permitted

Cancel appointment where permitted

Submit feedback

Change password

Doctor:

Login/logout

Dashboard

View appointments

View appointment details

Complete appointments where permitted

Cancel appointments where permitted

Work availability as defined by the existing system

Change password

Admin:

Login/logout

Dashboard

Manage doctors

Add/edit doctor information

View doctors

Manage administrators where already defined

View patients/appointments where already defined

View feedback

Change password

System

Authentication

Role-based access

Appointment scheduling

Doctor availability

30-minute slots

Appointment status handling

Database persistence

API communication

Input validation

Error handling

Responsive/cross-platform UI

Loading and empty states

Do not add new product features beyond this scope.

4. REMOVED TEST FEATURES

The following were test/placeholder subjects and must remain removed:

Settings test feature

Course Dashboard test feature

Unrelated test-only TODO/placeholder functionality

Do not recreate them.

Do not recreate their navigation entries, screens, imports, components, routes, or dead code.

This does not mean removing legitimate TODOs that represent unfinished hospital-system work. Legitimate in-scope TODOs should be completed.

5. AUTHORITATIVE EXTERNAL BACKEND

CRITICAL PATHS

The backend is NOT maintained inside the frontend repository.

Authoritative paths:

D:\New folder\IUS\7th-semester\Mobile Application and Development\Pokemon\backend\.env.runAtStart
D:\New folder\IUS\7th-semester\Mobile Application and Development\Pokemon\backend\src\ApiServer.java
D:\New folder\IUS\7th-semester\Mobile Application and Development\Pokemon\MY-APP\Schema.txt
C:\Users\User\eclipse-workspace\RefarenceForNativApp.zip

Rules

Treat these paths as authoritative.

Inspect them before changing API calls, authentication, appointments, or database-related behavior.

.env.runAtStart contains runtime/backend configuration and must be treated as sensitive.

ApiServer.java is the authoritative Java API server.

Schema.txt is the final database schema.

Do not create a replacement backend under MY-APP/backend.

If a copied backend exists inside the repository, do not automatically treat it as authoritative.

Do not duplicate backend source just to make the repository self-contained.

Frontend requests must match the external backend actually being run.

Backend restart

When backend source/configuration changes, or backend verification is required:

Restart the external backend when necessary.

Confirm it starts successfully.

Confirm affected API endpoints respond.

Test the affected frontend flow.

Fix errors rather than assuming success.

If the environment prevents access/restart, report that limitation clearly.

6. FINAL DATABASE SCHEMA IS LOCKED

Schema.txt is the final database design.

Known entities:

admins

doctors

doctor_availability

patients

appointments

feedback

Respect existing primary keys, foreign keys, unique constraints, validation rules, and relationships.

Core relationships:

patients 1 ---- * appointments * ---- 1 doctors
doctors 1 ---- * doctor_availability
patients 1 ---- * feedback

Do not redesign the schema for convenience.

If the frontend needs information not currently exposed by the backend, first check whether an existing API provides it. If not, make the smallest API/backend change necessary and keep the database schema unchanged unless the user explicitly approves a schema change.

7. APPOINTMENT BUSINESS RULES

Preserve the behavior defined by the reference hospital system and authoritative backend.

Doctor availability

The schema uses:

1 = Sunday
2 = Monday
3 = Tuesday
4 = Wednesday
5 = Thursday
6 = Friday
7 = Saturday

Do not accidentally use another weekday numbering convention.

Time slots

Use the doctor's working hours.

Appointment slots are 30 minutes apart.

Already-booked slots must not be offered.

Prevent double booking.

Do not hard-code working hours when the backend/database provides them.

Status

Preserve the approved status concepts:

BOOKED
COMPLETED
CANCELLED

Do not invent a complicated status workflow.

Changes/cancellation

Appointment time changes must respect availability.

Terminal/cancelled appointments must not be modified.

Cancellation must be consistent between frontend and backend.

Users must not be able to modify another patient's appointment.

Completion

Doctor completion must respect the timing/business rules already defined by the reference/backend. Do not weaken rules merely to make a button work.

8. CURRENT FRONTEND ARCHITECTURE

The existing project uses the Expo + React Native stack with TypeScript and React Navigation.

The current project is approximately:

Expo 56

React Native 0.85

React 19

React Native Web

TypeScript

React Navigation 7

The project uses React Navigation, not Expo Router.

Rules

Do not migrate to Expo Router automatically.

Do not perform major dependency upgrades/downgrades without a real reason.

Do not add unnecessary dependencies.

Check Expo compatibility before adding packages.

Preserve working dependencies whenever possible.

9. CROSS-PLATFORM REQUIREMENT

One shared application targets:

iOS

Android

Web

Prefer shared:

screens

components

state

API logic

validation

business logic

Use platform-specific files only when genuinely necessary:

Component.tsx
Component.web.tsx
Component.native.tsx
Component.ios.tsx
Component.android.tsx

Do not duplicate whole applications or screens unnecessarily.

10. API RULES

Known API areas include:

/api/login
/api/me
/api/signup
/api/doctors
/api/availability
/api/time-slots
/api/appointments
/api/appointments/change-time
/api/appointments/cancel
/api/patient-appointments
/api/feedback
/api/password

Before changing an endpoint:

Inspect ApiServer.java.

Confirm route and HTTP method.

Confirm request parameters/body.

Confirm response shape.

Inspect the frontend consumer.

Make the smallest compatible correction.

API base URL

Do not blindly hard-code localhost.

Remember:

Android physical devices treat localhost as the device itself.

Development may require the host machine's LAN IP.

Web networking differs from native networking.

Respect EXPO_PUBLIC_API_BASE_URL where appropriate.

Do not commit machine-specific secrets or sensitive configuration.

11. AUTHENTICATION AND SECURITY

Never hard-code credentials.

Never log passwords/tokens.

Never expose secrets in UI.

Protect authenticated screens.

Keep role-based access consistent.

Backend authorization remains the real security boundary.

Handle invalid/expired sessions gracefully.

Development credentials from the old/reference project must not become production credentials.

12. UI/UX RULES

Keep the UI appropriate for a university Hospital Appointment System.

Use:

responsive layouts

React Native primitives where practical

safe areas

accessible touch targets

clear forms

loading states

empty states

useful error messages

confirmation for destructive actions

consistent spacing and typography

clear appointment status indicators

Avoid:

unnecessary animations

unnecessary UI libraries

fixed desktop widths

hard-coded screen dimensions

tiny touch targets

excessive platform-specific hacks

visual features unrelated to the approved scope

13. NAVIGATION

Preserve the existing navigation architecture.

Verify:

public screens

protected screens

patient routes

doctor routes

admin routes

login/logout navigation

back navigation

Android back behavior

booking/cancellation navigation

invalid/protected route handling

There must be no dead navigation entries.

The removed test features must not return.

14. FORMS, STATE, AND ERRORS

Important forms must validate input before API requests.

Handle:

required fields

email validation

phone validation

reasonable age values

password requirements

password confirmation

valid appointment selection

API-dependent screens must correctly handle:

initial loading

success

empty results

network failure

backend failure

invalid response

authentication failure

retry/refresh where appropriate

Never show a fake success message when the backend operation failed.

15. IMPLEMENTATION WORKFLOW

For every future task:

1. Inspect

Inspect the repository and relevant external backend files.

2. Understand

Determine what works, what is incomplete, what is broken, and what is actually required.

3. Plan briefly

Make a short implementation plan.

4. Implement

Make the smallest clean changes that complete the approved functionality.

5. Integrate

If backend work is needed:

modify the authoritative external backend

keep the schema locked

restart backend when necessary

verify affected APIs

6. Test

Run appropriate static, build, and functional checks.

7. Fix

If a check fails, fix it and rerun it.

8. Report

Report:

changes made

backend changes

whether backend was restarted

checks performed

remaining limitations

16. TESTING / DEFINITION OF DONE

Before declaring the project complete, verify as much as the environment permits.

Static

Run appropriate:

TypeScript/type checking
linting, if configured
Expo validation

Functional

Verify:

app starts

Web starts

login/logout

registration

protected routes

doctor list

doctor availability

correct time slots

booking

duplicate-booking prevention

appointment list

appointment time change

cancellation

doctor completion

feedback

password change

admin functionality

loading states

empty states

error states

Cross-platform

Check for obvious breakage on:

Android

iOS

Web

If a platform cannot be executed in the environment, run all available checks and explicitly report the limitation.

17. DO NOT OVER-ENGINEER

This is a BSc CSE 3rd-year university project.

Do not add:

AI diagnosis

chatbot

video consultation

online payment

real-time messaging

GPS tracking

machine learning

microservices

complex notification infrastructure

unnecessary cloud infrastructure

unrelated analytics platforms

new authentication frameworks

unnecessary state-management frameworks

unrelated academic/demo modules

A smaller system that is fully functional is preferable to a larger unfinished system.

18. DO NOT BREAK WORKING CODE

Before changing existing functionality, determine why it exists.

Do not:

rewrite working screens unnecessarily

replace API contracts without checking the backend

change database names casually

change response formats without updating consumers

remove existing business rules

migrate navigation without need

introduce duplicate implementations

leave unused imports/routes/components

If a small fix solves the problem, use the small fix.

19. REFERENCE IMPLEMENTATION

The original hospital project is the functional reference.

Use it to understand:

patient workflow

doctor workflow

admin workflow

appointment scheduling

availability

cancellation

appointment changes

feedback

password changes

dashboards

general hospital-system UI behavior

Do not blindly copy its old JSP/web technology.

The current Expo/React Native project is the implementation target.

Reproduce the required functionality and business behavior, not obsolete technology.

20. SOURCE-OF-TRUTH ORDER

When investigating a requirement:

Explicit current user requirement

Final Schema.txt

Authoritative external ApiServer.java

Current frontend implementation

Original hospital reference

General engineering judgment

If sources disagree, do not silently invent a resolution. Make the smallest safe change and report the discrepancy.

21. FINAL QUALITY CHECK

Before declaring the project finished:

Approved hospital functionality is complete.

Final database schema is unchanged.

Frontend uses the correct external backend.

API behavior matches ApiServer.java.

Patient, doctor, and admin workflows work.

Appointment rules work.

30-minute slots work.

Booked/unavailable slots are excluded.

Authentication and protected routes work.

Errors are handled.

iOS/Android/Web compatibility is preserved.

Removed test features remain absent.

No dead navigation or obvious dead code remains.

External backend was restarted and verified when required.

Checks were actually run.

If something is incomplete, fix it when possible before declaring completion.

22. DEFAULT AGENT BEHAVIOR

For every coding task in this repository:

Inspect → Understand → Implement → Integrate → Restart/Verify backend when necessary → Test → Fix → Report.

Do not expand the scope.

Do not rebuild the project.

Do not add unrelated features.

Do not change the final database schema.

Do not create a duplicate backend.

Keep the project simple, complete, maintainable, and appropriate for a BSc CSE 3rd-year university project.

Implement first. Explain afterward.