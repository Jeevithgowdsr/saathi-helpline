# Incident Management Module Architecture

## 1. Overview
The Incident Management Module allows authorized agencies (Police, Fire, Medical) to track, manage, and resolve emergency incidents reported by users. It serves as the core operational tool for responders.

## 2. Firestore Schema (`incidents` collection)

Each document in the `incidents` collection represents a unique emergency event.

```json
{
  "id": "INC_1715628392",            // Unique Incident ID
  "userId": "user_abc123",           // ID of the reporter (if authenticated)
  "type": "medical",                 // 'medical', 'police', 'fire', 'women_safety', 'other'
  "severity": "critical",            // 'low', 'medium', 'high', 'critical'
  "status": "new",                   // 'new', 'assigned', 'in_progress', 'resolved', 'false_alarm'
  "description": "Car accident on MG Road",
  "location": {
    "lat": 12.9716,
    "lon": 77.5946,
    "address": "MG Road, Bangalore"
  },
  "contact": {
    "phone": "+919876543210",
    "name": "John Doe"
  },
  "assignedOfficer": {               // Null if unassigned
    "id": "off_xyz789",
    "name": "Officer Sharma",
    "unitId": "PCR-12"
  },
  "timeline": [                      // Audit trail of actions
    {
      "action": "created",
      "timestamp": "2024-05-13T10:00:00Z",
      "by": "user_abc123"
    },
    {
      "action": "status_change",
      "newStatus": "assigned",
      "timestamp": "2024-05-13T10:05:00Z",
      "by": "admin_456"
    }
  ],
  "createdAt": "2024-05-13T10:00:00Z",
  "updatedAt": "2024-05-13T10:05:00Z"
}
```

## 3. API Design (Service Layer)

These functions will be implemented in `src/admin/services/incidentService.js`.

### 3.1 Fetch Incidents
- **Function**: `getIncidents(filters)`
- **Filters**: Status, Severity, Date Range.
- **Access**: Admin, Agency Officer.

### 3.2 Create Incident (User/Manual)
- **Function**: `reportIncident(data)`
- **Inputs**: Location, Type, Description, Contact.
- **Access**: Public (Authenticated Users), Admin.

### 3.3 Update Status
- **Function**: `updateIncidentStatus(incidentId, newStatus, officerId)`
- **Inputs**: ID, Status ('assigned', 'resolved'), Officer Details.
- **Access**: Admin, Agency Officer.

### 3.4 Assign Officer
- **Function**: `assignOfficer(incidentId, officerData)`
- **Inputs**: ID, Officer Name/ID.
- **Access**: Admin, Agency Officer.

## 4. Security Rules (Update `firestore.rules`)

```javascript
match /incidents/{incidentId} {
  // Anyone can create a report
  allow create: if request.auth != null;
  
  // Only admins/officers can read full list or update
  allow read: if isAgencyOfficer();
  allow update: if isAgencyOfficer();
  
  // Users can read their own reports
  allow read: if request.auth.uid == resource.data.userId;
}
```
