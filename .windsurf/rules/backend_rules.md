---
trigger: model_decision
globs: backend/**
---

# 🎣 Fishio Backend - Rules for Cursor

**Objective:** These rules are intended to ensure that code generated or modified by Cursor is consistent with the Clean Architecture, Fishio project conventions, and the technologies used (.NET 9 Minimal API, MediatR, EF Core).

## 🏛️ 1. General Principles and Architecture

1.  **Adhere to Clean Architecture:**
    - **Domain:** Entities, value objects, enums, domain events, repository interfaces. No dependencies on other layers.
    - **Application:** Application logic, commands, queries (CQRS), DTOs, application service interfaces, validation. Depends only on Domain.
    - **Infrastructure:** Repository implementations, external services (e.g., email, file handling), EF Core configuration, migrations. Depends on Application and Domain.
    - **Api (Presentation):** Minimal API endpoints, HTTP request handling, mapping to MediatR commands/queries. Depends on Application.
2.  **CQRS with MediatR:**
    - Implement all state-modifying operations (Create, Update, Delete) as **Commands**.
    - Implement all data-reading operations as **Queries**.
    - Each command/query must have a dedicated **Handler**.
3.  **Dependency Injection (DI):**
    - All services, repositories, and MediatR handlers should be registered in the DI container.
    - Use `DependencyInjection.cs` files in the respective layers (`Application`, `Infrastructure`) for DI configuration.
    - Aggregate DI configurations from other layers in `Program.cs` (Api layer).
4.  **Invariants and Validation:**
    - Place validation logic and domain invariants within **domain entities** (constructors, methods).
    - Perform input data validation for commands/queries in the **Application** layer, preferably using **FluentValidation**, integrated with the MediatR pipeline (e.g., `ValidationBehavior`).
5.  **Error Handling:**
    - Use dedicated application exceptions (e.g., `NotFoundException`, `ValidationException` from `Application/Common/Exceptions/`).
    - Global exception handling is managed in `Api/Middleware/ExceptionHandlingMiddleware.cs`. Ensure new exception types are appropriately mapped to HTTP status codes there.
6.  **Asynchronicity:**
    - All I/O operations (e.g., database access, external API calls) must be **asynchronous** (`async/await`). Methods should return `Task` or `Task<T>`.
7.  **Naming and Folder Structure:**
    - Strictly follow the existing folder structure and naming conventions (e.g., `[FeatureName]Endpoints.cs`, `Create[EntityName]Command.cs`, `[EntityName]Repository.cs`).
    - Group new functionalities in the `Application` layer into folders corresponding to modules (e.g., `Application/NewFeature/...`).

## 🌍 2. Localization and Error Messages

**CRITICAL RULE: All user-facing error messages MUST be in Polish. All logging MUST remain in English.**

1.  **User-Facing Error Messages (Polish):**

    - All validation messages in FluentValidation validators must be in Polish using `.WithMessage("Polish message")`.
    - All exception messages that reach the user (via API responses) must be in Polish.
    - All error titles and details in ProblemDetails responses must be in Polish.
    - Domain exceptions thrown to users must have Polish messages.

2.  **Logging Messages (English):**

    - All `ILogger` log messages must remain in English for technical debugging.
    - Exception logging should be in English with technical details.
    - Performance and diagnostic logs should be in English.

3.  **Implementation Guidelines:**

    - When throwing exceptions that will reach users, use Polish messages.
    - When logging exceptions or technical information, use English.
    - Validation error messages in FluentValidation must be Polish.
    - Custom exception classes should have Polish messages in constructors.

## 🧬 3. Domain Layer (`Domain`)

1.  **Entities:**
    - Inherit from `BaseEntity` (for ID and domain events) or `BaseAuditableEntity` (additionally audit fields).
    - Constructors should accept necessary parameters to create a valid object and enforce invariants.
    - Properties should have private setters if modification is only allowed through entity methods.
    - Avoid infrastructure-related logic (e.g., direct EF Core calls).
2.  **Enums:**
    - Use enums for predefined, constant values (e.g., `CompetitionStatus`, `ParticipantRole`). Place them in `Domain/Enums/`.
3.  **Repository Interfaces:**
    - Define interfaces for repositories (e.g., `ICompetitionRepository`) in `Domain/Interfaces/` (create the folder if it doesn't exist). They specify the contract for data operations.

## ⚙️ 4. Application Layer (`Application`)

1.  **Commands and Queries (MediatR):**
    - Each command/query is a separate class (often a `record`) implementing `IRequest` or `IRequest<TResponse>`.
    - Place them in the structure `Application/[FeatureName]/Commands/[CommandName]/` or `Application/[FeatureName]/Queries/[QueryName]/`.
    - Names: `CreateCompetitionCommand.cs`, `GetCompetitionDetailsQuery.cs`.
    - **CRITICAL RULE: Commands and their validators MUST be in the same file for better cohesion.**
    - **CRITICAL RULE: Queries and their DTOs MUST be in the same file for better cohesion.**
2.  **MediatR Handlers:**
    - Each command/query must have its handler implementing `IRequestHandler<TRequest, TResponse>`.
    - Names: `CreateCompetitionCommandHandler.cs`, `GetCompetitionDetailsQueryHandler.cs`.
    - Handlers inject dependencies (e.g., `IApplicationDbContext`, other services) via the constructor.
    - Use-case-specific business logic resides here.
3.  **DTOs (Data Transfer Objects):**

    - Use DTOs to transfer data between layers, especially as results from queries.
    - **DTOs MUST be defined in the same file as the query that uses them.**
    - This improves code cohesion and makes maintenance easier.
    - Example structure:

      ```csharp
      public record GetCompetitionDetailsQuery(int CompetitionId) : IRequest<CompetitionDetailsDto>;

      public class CompetitionDetailsDto
      {
          public int Id { get; set; }
          public string Name { get; set; } = string.Empty;
          // ... other properties
      }
      ```

4.  **Validation (FluentValidation):**

    - For each command (and sometimes query) requiring validation, create a validator class inheriting from `AbstractValidator<TCommand>`.
    - **Validators MUST be defined in the same file as the command they validate.**
    - This ensures that command and its validation rules are always together.
    - Example structure:

    - Register validators in `Application/DependencyInjection.cs`.

5.  **Application Interfaces:**
    - Define interfaces for application services (e.g., `ICurrentUserService`, `IDateTimeService`) in `Application/Common/Interfaces/`.

## 🏗️ 5. Infrastructure Layer (`Infrastructure`)

1.  **Repository Implementations:**
    - Implement repository interfaces from the `Domain` layer.
    - Place them in `Infrastructure/Persistence/Repositories/`.
    - Use `ApplicationDbContext` for database interactions.
2.  **Entity Framework Core:**

    - **DbContext:** `ApplicationDbContext` is the main entry point to the database.
    - **Entity Configurations:** For each entity, create a configuration class (e.g., `CompetitionConfiguration.cs`) in `Infrastructure/Persistence/Configurations/`, implementing `IEntityTypeConfiguration<TEntity>`.
    - **Migrations:** After any change to the data model, remember to generate and apply EF Core migrations.

    **Migration Commands:**

    ```bash
    # Add new migration (replace "MigrationName" with descriptive name)
    dotnet ef migrations add "MigrationName" --project src/Infrastructure --startup-project src/API --output-dir Persistence/Migrations

    # Apply migrations to database
    dotnet ef database update --project src/Infrastructure --startup-project src/API

    # Remove last migration (if not applied to database yet)
    dotnet ef migrations remove --project src/Infrastructure --startup-project src/API

    # Generate SQL script for migration
    dotnet ef migrations script --project src/Infrastructure --startup-project src/API
    ```

    **Migration Best Practices:**

    - Always use descriptive names for migrations (e.g., "AddCompetitionTable", "UpdateUserProfileFields").
    - Test migrations on a copy of production data before applying to production.
    - Review generated migration code before applying - EF Core might not generate optimal SQL.
    - Never modify applied migrations - create a new migration to fix issues.
    - Keep migrations in version control and ensure they're applied in the correct order across environments.

3.  **Service Implementations:**
    - Implement service interfaces from the `Application` layer (e.g., `DateTimeService.cs`, `CompetitionTokenGenerator.cs`).
    - Place them in `Infrastructure/Services/`.

## 🌐 6. Presentation Layer (`Api`)

1.  **Minimal API Endpoints:**
    - Group related endpoints in dedicated files (e.g., `CompetitionEndpoints.cs`) in `Api/Endpoints/`.
    - Use `IEndpointRouteBuilder` extension methods (e.g., `public static class CompetitionEndpoints { public static void MapCompetitionApi(this IEndpointRouteBuilder app) { ... } }`).
    - Inject `ISender` (MediatR) into endpoints to send commands/queries.
    - Map data from the HTTP request (e.g., `[FromBody]`, `[FromRoute]`, `[FromQuery]`) to command/query objects.
    - Use `TypedResults` (e.g., `TypedResults.Ok()`, `TypedResults.NotFound()`, `TypedResults.CreatedAtRoute()`) to return responses.
2.  **Authentication and Authorization:**
    - Utilize `ICurrentUserService` to retrieve information about the logged-in user (Clerk ID).
    - Apply authorization attributes (e.g., `RequireAuthorization("SpecificPolicy")`) or `RequireAuthorization()` methods on endpoints.
    - Define authorization policies in `Program.cs` or in `Infrastructure/Identity/DependencyInjection.cs` (if identity-related).

## ✨ 7. Creating New Functionality (Example Workflow)

Let's assume we are adding a "Report Fishery Issues" feature:

1.  **Domain:**
    - Create an entity `FisheryIssue.cs` (e.g., with `Description`, `ReportedAt`, `FisheryId`, `ReporterUserId`, `Status`).
    - Define an enum `IssueStatus.cs` (e.g., `Open`, `InProgress`, `Resolved`).
2.  **Application:**
    - Create a folder `Application/FisheryIssues/`.
    - Inside it:
      - `Commands/ReportIssue/ReportFisheryIssueCommand.cs` (with `FisheryId`, `Description` + validator in the same file).
      - `Commands/ReportIssue/ReportFisheryIssueCommandHandler.cs` (save logic, use `IApplicationDbContext`, `ICurrentUserService`).
      - `Queries/GetFisheryIssues/GetFisheryIssuesQuery.cs` (e.g., by `FisheryId` + DTO in the same file).
      - `Queries/GetFisheryIssues/GetFisheryIssuesQueryHandler.cs`.
    - Register handlers and the validator in `Application/DependencyInjection.cs`.
3.  **Infrastructure:**
    - Add `DbSet<FisheryIssue>` to `ApplicationDbContext.cs`.
    - Create `FisheryIssueConfiguration.cs` in `Infrastructure/Persistence/Configurations/`.
    - Generate and apply an EF Core migration.
    - (Optional) If a specific repository is needed, create `IFisheryIssueRepository` in Domain and its implementation `FisheryIssueRepository` in Infrastructure.
4.  **Api:**
    - Create `FisheryIssueEndpoints.cs`.
    - Implement a `POST /api/fisheries/{fisheryId}/issues` endpoint mapping to `ReportFisheryIssueCommand`.
    - Implement a `GET /api/fisheries/{fisheryId}/issues` endpoint mapping to `GetFisheryIssuesQuery`.
    - Register the endpoint mapping in `Program.cs` (`app.MapFisheryIssueApi();`).

---
