# Development Debugging Guide

Use this order when something suddenly fails.

## 1. Record the failure

Write down the platform, user role, exact action, exact error message, expected result, and actual result. Reproduce the same failure before changing code.

## 2. Check the frontend

Run these from `MY-APP`:

```powershell
npx.cmd tsc --noEmit
npx.cmd expo export --platform web
```

For runtime errors, check the Expo/Metro terminal and the browser developer console. Never log passwords or bearer tokens.

## 3. Check the backend connection

The Java API listens on port `8080`:

```powershell
Test-NetConnection localhost -Port 8080
curl.exe -i http://localhost:8080/api/health
curl.exe -i http://localhost:8080/api/doctors
```

Expected health response:

```json
{"success":true,"api":"up","database":"up"}
```

If the API is running but the database is unavailable, the health response uses HTTP `503` and reports `database: "down"` without exposing database credentials or connection details.

For a physical Android or iOS device, test the forwarded Dev Tunnel URL instead:

```powershell
curl.exe -i https://your-tunnel-url/api/health
```

## 4. Check Oracle

If the health endpoint reports the database is down, check that Oracle is running and that the backend process has these environment variables:

```text
ORACLE_URL
ORACLE_USERNAME
ORACLE_PASSWORD
```

Restart the Java backend after changing backend source, Oracle settings, or database environment variables.

## 5. Retest one workflow

After fixing one issue, retest the same workflow on Web and mobile. Then run the TypeScript check again. Keep commits small so the last working state is easy to identify.
