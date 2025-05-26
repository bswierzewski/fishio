# Competition Status Flow Documentation

## Overview

This document describes the complete status flow for competitions in the Fishio application, including all available status transitions and their business rules.

## Competition Statuses

| Status                   | Description                                         | Polish Description      |
| ------------------------ | --------------------------------------------------- | ----------------------- |
| `Draft`                  | Initial status when competition is created          | Wersja robocza          |
| `PendingApproval`        | Competition is waiting for approval                 | W trakcie zatwierdzania |
| `AcceptingRegistrations` | Competition is open for participant registration    | Akceptacja zgłoszeń     |
| `Scheduled`              | Registrations are closed, competition is scheduled  | Zgłoszenia zamknięte    |
| `Upcoming`               | Competition is scheduled to start soon (within 24h) | Zaplanowane             |
| `Ongoing`                | Competition is currently running                    | Trwające                |
| `Finished`               | Competition has been completed                      | Zakończone              |
| `Cancelled`              | Competition has been cancelled                      | Anulowane               |

## Status Flow Diagram

```
Draft
├── RequestApproval() → PendingApproval
├── OpenRegistrations() → AcceptingRegistrations
└── CancelCompetition() → Cancelled

PendingApproval
├── ApproveCompetition() → AcceptingRegistrations
├── RejectApproval() → Draft
└── CancelCompetition() → Cancelled

AcceptingRegistrations
├── ScheduleCompetition() → Scheduled
└── CancelCompetition() → Cancelled

Scheduled
├── SetUpcoming() → Upcoming (when <24h to start)
├── ReopenRegistrations() → AcceptingRegistrations
├── StartCompetition() → Ongoing (when time comes)
└── CancelCompetition() → Cancelled

Upcoming
├── ReopenRegistrations() → AcceptingRegistrations
├── StartCompetition() → Ongoing
└── CancelCompetition() → Cancelled

Ongoing
├── FinishCompetition() → Finished
└── CancelCompetition() → Cancelled

Finished
└── (Terminal state)

Cancelled
└── (Terminal state)
```

## Status Transition Methods

### 1. Draft → PendingApproval

**Method:** `RequestApproval()`

- **Validation:** Must have at least one active primary scoring category
- **Use Case:** Submit competition for approval process

### 2. Draft → AcceptingRegistrations

**Method:** `OpenRegistrations()`

- **Validation:** Must have at least one active primary scoring category
- **Use Case:** Direct opening of registrations without approval (private competitions)

### 3. PendingApproval → AcceptingRegistrations

**Method:** `ApproveCompetition()`

- **Validation:** Must be in PendingApproval status
- **Use Case:** Approve competition after review

### 4. PendingApproval → Draft

**Method:** `RejectApproval(string reason)`

- **Validation:** Must be in PendingApproval status, reason required
- **Use Case:** Reject competition approval and send back for modifications

### 5. AcceptingRegistrations → Scheduled

**Method:** `ScheduleCompetition()`

- **Validation:** Start time must be in the future
- **Use Case:** Close registrations and schedule competition

### 6. Scheduled → Upcoming

**Method:** `SetUpcoming()`

- **Validation:** Must be within 24 hours of start time
- **Use Case:** Mark competition as upcoming when start is imminent

### 7. Scheduled/Upcoming → AcceptingRegistrations

**Method:** `ReopenRegistrations()`

- **Validation:** Start time must still be in the future
- **Use Case:** Reopen registrations if needed before competition starts

### 8. Scheduled/Upcoming → Ongoing

**Method:** `StartCompetition()`

- **Validation:** Current time must be after start time and before end time
- **Use Case:** Start the competition

### 9. Ongoing → Finished

**Method:** `FinishCompetition()`

- **Validation:** Must be in Ongoing status
- **Use Case:** Complete the competition

### 10. Any → Cancelled

**Method:** `CancelCompetition(string reason)`

- **Validation:** Cannot cancel Finished or already Cancelled competitions
- **Use Case:** Cancel competition for any reason

## Business Rules

### Competition Creation

- New competitions are created in `Draft` status
- Organizer is automatically added as a participant with `Organizer` role

### Registration Management

- Participants can only join during `AcceptingRegistrations` status (for public competitions)
- Organizers can add participants in `Draft`, `AcceptingRegistrations`, and `Scheduled` statuses
- Guest participants can be added in the same statuses as regular participants

### Category Requirements

- At least one active primary scoring category is required before:
  - Requesting approval (`RequestApproval`)
  - Opening registrations (`OpenRegistrations`)

### Time-based Validations

- Competitions cannot be scheduled if start time has passed
- Competitions cannot start before scheduled start time
- Competitions cannot start after scheduled end time
- `Upcoming` status can only be set within 24 hours of start time

### Terminal States

- `Finished` and `Cancelled` are terminal states
- No transitions are allowed from these states

## API Endpoints

The following API endpoints should be implemented to support status transitions:

- `POST /api/competitions/{id}/request-approval` - RequestApproval()
- `POST /api/competitions/{id}/open-registrations` - OpenRegistrations()
- `POST /api/competitions/{id}/approve` - ApproveCompetition()
- `POST /api/competitions/{id}/reject-approval` - RejectApproval()
- `POST /api/competitions/{id}/schedule` - ScheduleCompetition()
- `POST /api/competitions/{id}/set-upcoming` - SetUpcoming()
- `POST /api/competitions/{id}/reopen-registrations` - ReopenRegistrations()
- `POST /api/competitions/{id}/start` - StartCompetition()
- `POST /api/competitions/{id}/finish` - FinishCompetition()
- `POST /api/competitions/{id}/cancel` - CancelCompetition()

## Error Handling

All status transition methods throw `InvalidOperationException` with descriptive messages when:

- Current status doesn't allow the transition
- Business rules are violated
- Time-based validations fail

These exceptions should be handled by the global exception middleware and returned as appropriate HTTP status codes (400 Bad Request).
