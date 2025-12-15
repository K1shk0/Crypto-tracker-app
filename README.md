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

## Application Flow

```mermaid
flowchart TD
    A[User opens app] --> B[Angular loads main.ts]
    B --> C[AppComponent initializes]
    C --> D[App routes configured]

    D -->|Public route| E[Login or Register]
    D -->|Protected route| F[Auth Guard]

    E --> E1[Login component]
    E --> E2[Register component]

    E1 -->|Submit credentials| G[Auth service]
    E2 -->|Submit data| G

    G --> H[Backend server.js]
    H --> I[auth.js verifies user]
    I -->|Valid| J[JWT token returned]
    I -->|Invalid| K[Auth error]

    J --> L[Token stored in browser]
    L --> M[Auth Interceptor attaches token]

    M --> F
    F -->|Authorized| N[Market component]
    F -->|Unauthorized| E

    N --> O[Crypto service]
    O --> P[crypto-api backend]
    P --> Q[External crypto API]
    Q --> P --> O --> R[Market data displayed]

