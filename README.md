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






```mermaid
graph TD
%% --- USER LANE ---
subgraph USER [USER]
    A1[Start app] --> A2[Create account]
    A2 --> A3[Fill form] 
    A3 --> A4[Submit]
    L1[Login page] --> L2[Fill login] 
    L2 --> L3[Login]
    M1[Market page] --> M2[My Profile]
    M2 --> M3[Go to profile]
    M3 --> M4[Buy coin]
    M4 --> M5[Enter amount]
    M5 --> M6[Confirm purchase]
end

%% --- FRONTEND LANE ---
subgraph FRONTEND [FRONTEND - Angular]
    A4 --> F1{Form valid?}
    F1 -- No --> F2[Show error]
    F1 -- Yes --> F3[POST /api/register]
    F3 --> F4{Response?}
    F4 -- Error --> F2
    F4 -- Success --> L1
    L3 --> F5{Login valid?}
    F5 -- No --> F2
    F5 -- Yes --> F6[POST /api/login]
    F6 --> F7{Response?}
    F7 -- Success --> M1
    F7 -- Error --> F2
    M3 --> F8[Fetch wallet]
    M6 --> F9[POST /api/wallet/add]
    F9 --> F8
end

%% --- BACKEND LANE ---
subgraph BACKEND [BACKEND - Node.js]
    F3 --> B1[Receive register]
    B1 --> B2[Validate fields]
    B2 --> B3[Insert user into DB / Return response]
    F6 --> B4[Receive login]
    B4 --> B5[Validate & create JWT]
    B3 --> B6
    B5 --> B6
    F8 --> B7[Auth check & wallet request]
    B7 --> B8[Return wallet data]
end

%% --- DATABASE LANE ---
subgraph DATABASE [DATABASE - PostgreSQL]
    B3 --> D1[Insert / Check user]
    B5 --> D2[Query user table]
    B8 --> D3[Query / Update wallet]
    D1 --> B3
    D2 --> B5
    D3 --> B8
end

%% --- CONNECTIONS ---
B6 --> F4









