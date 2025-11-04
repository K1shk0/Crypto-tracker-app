# CryptoTracker

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 20.3.7.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.






## 🔄 Full System Flowchart – Registration, Login, and Wallet

```mermaid
graph TD
%% --- USER LANE ---
    subgraph USER [USER]
        A[Start - User opens app] --> B[Clicks Create account]
        B --> C[Fills form: username, email, password]
        C --> D[Presses Submit]
        J1[Back on login page] --> J2[Fills login form: email, password]
        J2 --> J3[Presses Login]
        U1[On market page] --> U2[Clicks My Profile]
        U2 --> U3[Navigates to profile]
        U3 --> U4[Clicks Buy on coin]
        U4 --> U5[Inputs amount]
        U5 --> U6[Presses Confirm Purchase]
    end

%% --- FRONTEND LANE ---
    subgraph FRONTEND [FRONTEND - Angular]
        D --> E{Is form valid?}
        E -- No --> F[Show validation error]
        E -- Yes --> G[POST /api/register]
        G --> H{Waiting for response}
        H -- Error --> I[Show API error, e.g. email in use]
        H -- Success --> J[Navigate to login page]
        J --> J1
        J3 --> K{Is login form valid?}
        K -- No --> L[Show validation error]
        K -- Yes --> M[POST /api/login]
        M --> N{Waiting for response}
        N -- Success --> O[Store token in localStorage]
        O --> P[Navigate to market page]
        N -- Error --> Q[Show login error]
        U3 --> R[ProfileComponent onInit]
        R --> S[GET /api/wallet]
        S --> T[Auth Interceptor adds token]
        T --> U[Send request to backend]
        U --> V{Waiting for response}
        V -- Success --> W[Display wallet data]
        V -- Unauthorized --> X[Logout and go to login]
        U6 --> Y[POST /api/wallet/add]
        Y --> T
    end

%% --- BACKEND LANE ---
    subgraph BACKEND [BACKEND - Node.js]
        G --> B1[Receive register data]
        B1 --> B2{Missing fields?}
        B2 -- Yes --> B3[Send 400 Bad Request]
        B2 -- No --> B4[Hash password with bcrypt]
        B4 --> B5[Insert new user into DB]
        M --> B6[Receive login data]
        B6 --> B7[Query users table]
        B7 --> B8{User found?}
        B8 -- No --> B9[Send 401 Unauthorized]
        B8 -- Yes --> B10[Compare password]
        B10 --> B11{Password correct?}
        B11 -- No --> B9
        B11 -- Yes --> B12[Create JWT token]
        B12 --> B13[Send 200 OK with token]
        U --> B14[Auth middleware checks token]
        B14 --> B15{Token valid?}
        B15 -- No --> B16[Send 401 Access Denied]
        B15 -- Yes --> B17[Attach user id to request]
        B17 --> B18[Run GET /api/wallet]
        B18 --> B19[Select wallet by user id]
        Y --> B20[Run POST /api/wallet/add]
        B20 --> B21{User owns coin?}
        B21 -- Yes --> B22[Update wallet amount]
        B21 -- No --> B23[Insert new wallet row]
        B22 --> B24[Insert transaction log]
        B23 --> B24
    end

%% --- DATABASE LANE ---
    subgraph DATABASE [DATABASE - PostgreSQL]
        B5 --> D1{Email or username exists?}
        D1 -- Yes --> D2[Return unique violation]
        D1 -- No --> D3[Create user row]
        D3 --> D4[Return success]
        B7 --> D5[Return user row or none]
        B19 --> D6[Return wallet data]
        B22 --> D7[Update wallet record]
        B23 --> D8[Insert wallet record]
    end

%% --- CONNECTIONS BETWEEN LANES ---
    D4 --> H
    B3 --> H
    D5 --> N
    D6 --> V
    D7 --> V
    D8 --> V
    B9 --> N
    B13 --> N
    B16 --> V










