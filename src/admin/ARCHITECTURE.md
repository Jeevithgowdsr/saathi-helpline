# Admin Panel Architecture & Module Structure

## 1. Overview
The Admin Panel is a secure, role-based interface for managing the Saathi Helpline ecosystem. It is built within the existing React application but isolated in the `src/admin` directory.

## 2. Security Model
- **Authentication**: Firebase Authentication (Email/Password).
- **Authorization**: Role-Based Access Control (RBAC) stored in Firestore `users` collection.
- **Roles**:
    - **Super Admin**: Full system access. Can manage other admins.
    - **Admin**: Can manage helplines, agencies, and view global reports.
    - **Agency Officer**: Restricted access. Can only manage their specific agency's profile and view relevant alerts/reports.

## 3. Folder Structure
```
src/
  admin/
    components/         # Reusable admin UI components
      AdminLayout.js    # Sidebar + Header wrapper
      StatCard.js       # Dashboard widget
      RoleRoute.js      # Protected Route wrapper
    context/
      AdminAuth.js      # Context for admin session & role state
    pages/
      AdminLogin.js     # Login screen
      Dashboard.js      # Main overview
      Helplines.js      # CRUD for helplines
      Agencies.js       # Agency management
      Reports.js        # User report viewer
    utils/
      permissions.js    # Role checking logic
```

## 4. Data Model (Firestore)
### `users` (Collection)
```json
{
  "uid": "user_123",
  "email": "admin@saathi.org",
  "role": "admin", // 'super-admin', 'admin', 'agency-officer', 'user'
  "agencyId": "agency_abc" // Optional, for officers
}
```

### `reports` (Collection)
```json
{
  "id": "rep_001",
  "type": "missing_person",
  "status": "open", // 'open', 'investigating', 'resolved'
  "location": { "lat": 12.97, "lon": 77.59 },
  "timestamp": "2025-12-02T10:00:00Z"
}
```

## 5. Implementation Steps
1.  **Deploy Rules**: `firebase deploy --only firestore:rules`
2.  **Create Admin User**: Manually set `role: 'super-admin'` in Firestore for the first user.
3.  **Integrate**: Wrap admin routes in `App.js` with `<RoleRoute allowedRoles={['admin']} />`.

## 6. Integrated System Architecture Diagram

```mermaid
graph TD
    A[User Interface] --> B{Frontend React App}
    B --> C[Public User Features]
    B --> D[Admin Panel]
    C --> E[Helpline Directory]
    C --> F[Saathi AI Assistant]
    C --> G[Panic Mode]
    C --> H[Emergency Map]
    D --> I[Dashboard]
    D --> J[Helpline Manager]
    D --> K[Alert Manager]
    D --> L[Reports]
    M[ML Recommendation Engine] --> N[Python Backend]
    O[MongoDB Database] --> P[Node.js Backend]
    Q[Firebase Auth/Firestore] --> B
    B --> N
    B --> P
    
    subgraph "Frontend Layer"
        B
        C
        D
        E
        F
        G
        H
        I
        J
        K
        L
    end
    
    subgraph "Backend Services"
        P
        N
        O
        M
    end
    
    subgraph "Data Storage"
        O
        MongoDB[(MongoDB)]
    end
    
    subgraph "External Services"
        R[Google Maps API]
        S[SMS Gateway]
        T[Email Service]
    end
    
    P --> MongoDB
    F --> N
    H --> R
    G --> S
    G --> T
```

## 7. Component Interaction Flow Diagram

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant B as Backend API
    participant M as ML Engine
    participant DB as Database
    participant E as External Services
    
    U->>F: Opens Saathi App
    F->>DB: Fetch helpline data
    DB-->>F: Return helplines
    F->>U: Display helpline directory
    
    U->>F: Uses Saathi AI Assistant
    F->>M: Send user query
    M->>M: Process NLP
    M->>DB: Fetch context data
    DB-->>M: Return relevant data
    M->>M: Generate recommendations
    M-->>F: Return recommendations
    F->>U: Display AI suggestions
    
    U->>F: Activates Panic Mode
    F->>F: Capture photo & location
    F->>E: Send SMS alerts
    F->>E: Send location data
    E->>U: Deliver alerts to contacts
    F->>DB: Log panic event
    DB-->>F: Confirm logging
    
    U->>F: Reports incorrect helpline
    F->>B: Submit report
    B->>DB: Store report
    DB-->>B: Confirm storage
    B-->>F: Return success
    F->>U: Show confirmation
    
    Admin->>F: Login to Admin Panel
    F->>DB: Authenticate user
    DB-->>F: Return user role
    F->>Admin: Redirect to dashboard
    
    Admin->>F: Manage helplines
    F->>B: CRUD operations
    B->>DB: Update helpline data
    DB-->>B: Confirm changes
    B-->>F: Return updated data
    F->>Admin: Refresh display
```

## 8. Data Flow Architecture Diagram

```mermaid
graph LR
    A[User Input] --> B[React Frontend]
    B --> C[Firebase Authentication]
    C --> D{Authorized?}
    D -->|Yes| E[Firebase Firestore]
    D -->|No| F[Login Screen]
    E --> G[User Data]
    E --> H[Admin Roles]
    E --> I[Incident Reports]
    
    B --> J[Node.js Backend]
    J --> K[MongoDB]
    K --> L[Helpline Data]
    
    B --> M[Python ML Engine]
    M --> N[Recommendation Logic]
    N --> O[NLP Processing]
    O --> P[Helpline Matching]
    
    P --> Q[Ranked Results]
    Q --> R[Frontend Display]
    R --> A
    
    B --> S[Google Maps API]
    S --> T[Location Services]
    T --> U[Map Visualization]
    U --> A
    
    B --> V[SMS Gateway]
    V --> W[Emergency Alerts]
    W --> X[Contact List]
    X --> A
    
    subgraph "Frontend"
        B
        R
        U
    end
    
    subgraph "Authentication & User Data"
        C
        E
        F
        G
        H
        I
    end
    
    subgraph "Backend Services"
        J
        M
        N
        O
        P
        Q
    end
    
    subgraph "Data Storage"
        K
        L
    end
    
    subgraph "External APIs"
        S
        V
    end
```

## 9. User Journey and Emergency Response Flow

```mermaid
flowchart TD
    A[User Opens Saathi App] --> B[Main Dashboard]
    B --> C{What does user need?}
    
    C -->|Find Helpline| D[Helpline Directory]
    C -->|AI Assistance| E[Saathi Assistant]
    C -->|Immediate Danger| F[Panic Mode]
    C -->|View Map| G[Emergency Map]
    
    D --> H[Search/Browse Helplines]
    H --> I[Filter by Category]
    I --> J[View Helpline Details]
    J --> K{User Action}
    K -->|Call| L[Dial Number]
    K -->|Save| M[Add to Favorites]
    K -->|Report| N[Flag Issue]
    
    E --> O[Enter Query]
    O --> P[NLP Processing]
    P --> Q[AI Recommendations]
    Q --> R[Display Results]
    R --> S{User Decision}
    S -->|Accept| T[Connect to Helpline]
    S -->|Refine| U[Modify Query]
    
    F --> V[Countdown Timer]
    V --> W[Capture Photo]
    W --> X[Get Location]
    X --> Y[Send Alerts]
    Y --> Z[Notify Contacts]
    
    G --> AA[View Nearby Services]
    AA --> AB[See Service Locations]
    AB --> AC{User Action}
    AC -->|Get Directions| AD[Open Maps]
    AC -->|Call Service| AE[Dial Number]
    
    subgraph "Emergency Response Path"
        F
        V
        W
        X
        Y
        Z
    end
    
    subgraph "Information Discovery Path"
        D
        E
        H
        I
        J
        O
        P
        Q
        AA
        AB
    end
```

## 10. Entity Relationship Diagram

```mermaid
erDiagram
    USERS {
        string uid PK
        string email
        string role
        string agencyId
        datetime createdAt
        datetime lastLogin
    }
    
    HELPLINES {
        string id PK
        string name
        string number
        string category
        string description
        string keywords
        float lat
        float lon
        boolean isActive
        float successRate
        datetime createdAt
        datetime updatedAt
    }
    
    INCIDENTS {
        string id PK
        string userId
        string type
        string severity
        string status
        string description
        string assignedOfficerId
        datetime createdAt
        datetime updatedAt
    }
    
    REPORTS {
        string id PK
        string userId
        string type
        string status
        string description
        datetime timestamp
    }
    
    EMERGENCY_CONTACTS {
        string id PK
        string userId
        string name
        string phone
        boolean isPrimary
        datetime createdAt
    }
    
    AGENCIES {
        string id PK
        string name
        string description
        string contactPerson
        string phone
        string email
        string address
        datetime createdAt
        datetime updatedAt
    }
    
    AUDIT_LOGS {
        string id PK
        string userId
        string action
        string resourceType
        string resourceId
        string details
        datetime timestamp
    }
    
    FAVORITES {
        string id PK
        string userId
        string helplineId
        datetime createdAt
    }
    
    INCIDENT_TIMELINE {
        string id PK
        string incidentId
        string action
        string newStatus
        string performedBy
        datetime timestamp
    }
    
    USERS ||--o{ EMERGENCY_CONTACTS : "has"
    USERS ||--o{ REPORTS : "creates"
    USERS ||--o{ INCIDENTS : "reports"
    USERS ||--o{ FAVORITES : "marks"
    USERS ||--o{ AUDIT_LOGS : "generates"
    
    HELPLINES ||--o{ FAVORITES : "favorited"
    HELPLINES ||--o{ REPORTS : "reported"
    
    INCIDENTS ||--o{ INCIDENT_TIMELINE : "tracks"
    INCIDENTS ||--o{ AUDIT_LOGS : "logs"
    
    AGENCIES ||--o{ USERS : "employs"
    AGENCIES ||--o{ HELPLINES : "manages"
    
    REPORTS ||--o{ AUDIT_LOGS : "logs"
```

## 11. Complete Integrated System Diagram

```mermaid
graph TB
    subgraph "CLIENT DEVICES"
        A[Web Browser] --> B[Progressive Web App]
        C[Mobile Device] --> B
        D[Desktop Computer] --> B
    end
    
    subgraph "FRONTEND LAYER"
        B --> E[React Application]
        
        subgraph "PUBLIC INTERFACE"
            E --> F[Main App]
            F --> G[Helpline Directory]
            F --> H[Saathi AI Assistant]
            F --> I[Panic Mode]
            F --> J[Emergency Map]
            F --> K[First Aid Guide]
            F --> L[Voice Assistant]
        end
        
        subgraph "ADMIN INTERFACE"
            E --> M[Admin Panel]
            M --> N[Login System]
            M --> O[Dashboard]
            M --> P[Helpline Manager]
            M --> Q[Incident Tracker]
            M --> R[Analytics]
            M --> S[User Management]
        end
    end
    
    subgraph "BACKEND SERVICES"
        T[Node.js API Server] --> U[MongoDB Database]
        V[Python ML Engine] --> W[Flask API]
        X[Firebase Services] --> Y[Firebase Auth]
        X --> Z[Firebase Firestore]
    end
    
    subgraph "EXTERNAL SERVICES"
        AA[Google Maps API]
        AB[SMS Gateway]
        AC[Email Services]
        AD[Social Media APIs]
    end
    
    E --> T
    E --> V
    E --> X
    H --> W
    J --> AA
    I --> AB
    I --> AC
    O --> Z
    P --> U
    Q --> Z
    R --> Z
    S --> Z
    
    subgraph "DATA FLOW"
        direction LR
        AF[User Input] --> AG[Frontend Processing]
        AG --> AH[Backend Requests]
        AH --> AI[Database Operations]
        AH --> AJ[ML Processing]
        AH --> AK[External API Calls]
        AI --> AL[Data Storage]
        AJ --> AM[AI Insights]
        AK --> AN[External Responses]
        AL --> AO[Data Retrieval]
        AM --> AP[Recommendations]
        AN --> AQ[Service Data]
        AO --> AR[Frontend Display]
        AP --> AR
        AQ --> AR
        AR --> AF
    end
    
    style A fill:#e1f5fe
    style C fill:#e1f5fe
    style D fill:#e1f5fe
    style F fill:#f3e5f5
    style G fill:#f3e5f5
    style H fill:#f3e5f5
    style I fill:#f3e5f5
    style J fill:#f3e5f5
    style K fill:#f3e5f5
    style L fill:#f3e5f5
    style M fill:#fff3e0
    style N fill:#fff3e0
    style O fill:#fff3e0
    style P fill:#fff3e0
    style Q fill:#fff3e0
    style R fill:#fff3e0
    style S fill:#fff3e0
    style T fill:#e8f5e8
    style V fill:#e8f5e8
    style X fill:#e8f5e8
    style AA fill:#fce4ec
    style AB fill:#fce4ec
    style AC fill:#fce4ec
```