```markdown
# Identity Reconciliation Service

This Node.js application provides an identity reconciliation service using Express and PostgreSQL for managing customer contacts based on email and phone numbers.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Endpoints](#endpoints)
- [Database Schema](#database-schema)
- [Configuration](#configuration)
- [Contributing](#contributing)
- [License](#license)

## Installation

### Prerequisites

Before you begin, ensure you have the following installed:

- Node.js and npm (Node Package Manager)
- PostgreSQL

### Clone Repository

```bash
git clone ...
cd identity-reconciliation
```

### Install Dependencies

```bash
npm install
```

### Set Up Environment Variables

Create a `.env` file in the root directory with the following variables:

```dotenv
DB_USER=your_database_user
DB_HOST=your_database_host
DB_NAME=your_database_name
DB_PASSWORD=your_database_password
DB_PORT=5432
```

## Usage

To start the application, run:

```bash
npm start
```

The application will start on http://localhost:3000 by default.

## Endpoints

### POST /identify

This endpoint handles identity reconciliation based on email or phoneNumber.

#### Request

```json
{
  "email": "customer@example.com",
  "phoneNumber": "1234567890"
}
```

#### Response

```json
{
  "contact": {
    "primaryContactId": 1,
    "emails": ["customer@example.com"],
    "phoneNumbers": ["1234567890"],
    "secondaryContactIds": []
  }
}
```

## Database Schema

The PostgreSQL database schema used in this application includes a `contacts` table with the following structure:

```sql
CREATE TABLE IF NOT EXISTS contacts (
  id SERIAL PRIMARY KEY,
  phoneNumber VARCHAR(15),
  email VARCHAR(255),
  linkedId INT REFERENCES contacts(id),
  linkPrecedence VARCHAR(10) CHECK (linkPrecedence IN ('primary', 'secondary')),
  createdAt TIMESTAMPTZ DEFAULT NOW(),
  updatedAt TIMESTAMPTZ DEFAULT NOW(),
  deletedAt TIMESTAMPTZ
);
```

## Configuration

Ensure that the `.env` file contains correct database credentials and that PostgreSQL is running and accessible.

## Contributing

Contributions are welcome! Please fork the repository and create a pull request with your changes.


```

