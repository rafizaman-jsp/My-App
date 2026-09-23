# Hospital Appointment System

An Expo/React Native application for patients, doctors, and
administrators. The app supports patient registration and login,
doctor availability, appointment booking and rescheduling,
feedback, password changes, and administrator management of
doctors and weekdays.

## Project structure

- `src/` — Expo and React Native frontend
- `../backend/src/` — plain Java HTTP API backed by Oracle
- `Schema.txt` — fresh Oracle schema, indexes, and sample data
- `DEBUGGING.md` — development troubleshooting checklist

## Requirements

- Node.js and npm
- JDK 17 or newer
- Oracle Database
- Oracle JDBC driver, such as `ojdbc11.jar`

## Database setup

For a fresh database, run [`Schema.txt`](./Schema.txt) in SQL*Plus or Oracle SQL Developer.
It creates the tables, doctor weekday availability, the unique active appointment-slot index, and sample accounts/data.

Fresh-schema sample accounts:

| Role    | Login ID            | Password     |
| ------- | ------------------- | ------------ |
| Admin   | `Super Admin`       | `admin123`   |
| Doctor  |         `84`        | `doc123`     |
| Patient | `amina@example.com` | `patient123` |

These credentials are for local development only. Change them before deployment. New passwords are stored as PBKDF2 hashes; old sample passwords are upgraded after their first successful login.

## Current rebuilt database test accounts

These are the 12 test users currently available in the rebuilt database.

| Role    | User         | Login credential | Password     |
| ------- | ------------ | ---------------- | ------------ |
| Admin   | Super Admin  | `Super Admin`    | `admin123`   |
| Admin   | System Admin | `System Admin`   | `admin456`   |
| Doctor  | Dr. Rahman   |      `84`        | `doc123`     |
| Doctor  | Dr. Ayesha Khan |   `85`        | `doc123`     |
| Doctor  | Dr. Karim    |      `86`        | `doc123`     |
| Doctor  | Dr. Nusrat   |      `87`        | `doc123`     |
| Doctor  | Dr. Hasan    |      `88`        | `doc123`     |
| Patient | Amina Rahman | `amina@pms.com`  | `patient123` |
| Patient | Tanvir Ahmed | `tanvir@pms.com` | `patient123` |
| Patient | Nadia Islam  | `nadia@pms.com`  | `patient123` |
| Patient | Fahim Hasan  | `fahim@pms.com`  | `patient123` |
| Patient | Sadia Akter  | `sadia@pms.com`  | `patient123` |

These credentials are for development and testing only. Do not use them in production.

If an existing database was created from an older schema, add the doctor fees column before starting the API:

```sql
ALTER TABLE doctors ADD fees NUMBER(8,2);
```

Existing duplicate `BOOKED` appointments must be resolved before creating `uq_active_doctor_slot`. Keep the original appointment and mark extra rows as `CANCELLED`.

## Start the backend

From the `backend` directory, set the Oracle connection variables and compile the Java sources:

```powershell
$env:ORACLE_URL = 'jdbc:oracle:thin:@localhost:1521:xe'
$env:ORACLE_USERNAME = 'c##idp1_1'
$env:ORACLE_PASSWORD = 'your-database-password'
$jdbcJar = 'C:\path\to\ojdbc11.jar'

New-Item -ItemType Directory -Force out
javac --add-modules jdk.httpserver -cp $jdbcJar -d out src\*.java
java --add-modules jdk.httpserver -cp "out;$jdbcJar" ApiServer
```

The API runs on port `8080`. Check the API and Oracle connection with:

```powershell
curl.exe -i http://localhost:8080/api/health
```

## Start the frontend

From `MY-APP`:

```powershell
npm install
npm start
```

The frontend uses `http://localhost:8080` by default on web and
the configured Android LAN address on Android.
For a physical device or VS Code Dev Tunnel, set the important
environment variable before starting Expo:

```powershell
$env:EXPO_PUBLIC_API_BASE_URL = 'https://your-dev-tunnel-url/'
npm start
```

The same variable may be stored in the local `.env` file.
Do not commit private credentials or temporary tunnel values.

Useful commands:

```powershell
npm run web
npx.cmd tsc --noEmit
npx.cmd expo export --platform web
```

## Main behavior

- Sessions expire after eight hours and can be revoked with logout.
- Doctor add/edit forms manage working hours, fees, and weekdays.
- Weekdays use JavaScript mapping: `0 = Sunday` through `6 = Saturday`.
- The backend validates doctor schedules and appointment slots independently of the UI.
- Oracle prevents two active bookings for the same doctor, date, and time.

For troubleshooting, see [`DEBUGGING.md`](./DEBUGGING.md).
