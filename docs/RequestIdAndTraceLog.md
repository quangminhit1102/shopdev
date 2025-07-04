```mermaid

flowchart TD
    A["user<br/>(proxy)"] -->|"requestId: 11223344"| B["router<br/>(/api/v1/login)"]
    B -->|"requestId: 11223344"| C["Validate params, input<br/>"]
    C -->|"requestId: 11223344"| D["Permission, Authentication, Authorization<br/>(shop, admin, user)"]
    D -->|"requestId: 11223344"| E["Service.login...<br/>(response success or<br/>error)"]
    E -->|"requestId: 11223344"| A

    style A fill:#1a1a1a,stroke:#ff6b35,stroke-width:3px,color:#fff
    style B fill:#4a90e2,stroke:#ff6b35,stroke-width:2px,color:#fff
    style C fill:#4a90e2,stroke:#ff6b35,stroke-width:2px,color:#fff
    style D fill:#4a90e2,stroke:#ff6b35,stroke-width:2px,color:#fff
    style E fill:#4a90e2,stroke:#ff6b35,stroke-width:2px,color:#fff
```

## Why Do We Need Trace ID or Request ID in Backend Logging?

When developing backend systems, it's crucial to track and debug requests as they flow through various services and components. This is where **trace IDs** or **request IDs** become essential.

### Key Reasons:

- **End-to-End Tracking:** Assigning a unique ID to each request allows you to trace its journey across microservices, APIs, and databases.
- **Simplified Debugging:** When an error occurs, you can search logs using the request ID to quickly find all related log entries.
- **Performance Monitoring:** Helps in measuring the time taken by each part of the system to process a request.
- **Correlation Across Services:** In distributed systems, a trace ID enables correlation of logs from different services handling the same request.
- **Improved Support:** When users report issues, providing a request ID helps engineers quickly locate relevant logs.

## Common Log Levels Explained

Logging frameworks typically support several log levels to categorize the importance and type of messages:

| Level     | Description                                                                                         | Example Use Case                             |
| --------- | --------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| **TRACE** | Most detailed information, typically of interest only when diagnosing problems.                     | Entering/exiting functions, variable values. |
| **DEBUG** | Fine-grained informational events useful for debugging an application.                              | Debugging logic, internal state changes.     |
| **INFO**  | General operational entries about application progress.                                             | Successful startup, user logins.             |
| **WARN**  | Indications of potential problems or situations that are unexpected, but the application continues. | Deprecated API usage, slow responses.        |
| **ERROR** | Error events that might still allow the application to continue running.                            | Failed database connection, exceptions.      |
| **FATAL** | Very severe error events that will presumably lead the application to abort.                        | Unrecoverable system failures.               |

Choosing the appropriate log level helps filter and prioritize log messages, making it easier to monitor and troubleshoot systems effectively.
