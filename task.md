# Backend Coding Task - Assembly Parts

## Tech Stack
- **Language:** TypeScript
- **Framework:** NodeJS or NestJS
- **Database:** PostgreSQL or MongoDB (use any ORM/ODM you're comfortable with)
- **Architecture:** MVC Pattern
- **Deliverable:** Public GitHub or GitLab repository.

## Key Points
- All incoming requests must be validated (e.g., using class-validator or equivalent).
- Write your best code — prioritize clarity, structure, and maintainability.
- Use clean-code practices: meaningful names, small functions, and avoid duplication (DRY principle).
- Follow SOLID principles to ensure extensible and loosely coupled design.
- You are encouraged to use AI tools (e.g., GitHub Copilot, ChatGPT) to improve productivity and code quality.


## Core Requirements
The system supports two types of parts:
1. Raw Parts
    - Purchased from external suppliers
    - Example: Bolts
2. Assembled Parts
    - Built by combining raw and/or other assembled parts
    - Example: Gearbox made using Bolts (raw) and Gears (assembled)


#### Part Types and Properties
Each part in the system have:
- A unique identifier (string) 
- Name 
- Type: `RAW` or `ASSEMBLED`
- Quantity in stock

Assembled parts should additionally store:
- A list of required constituent parts (with required quantity).


## Problem Statement
Implement following REST APIs to manage “parts” inventory for a manufacturing plant.

### Create part entry
API to register raw and assembled parts 

`[POST] /api/part`

**Request to register a raw part:**
```json
{
    "name": "Bolt",
    "type": "RAW"
}
```

**Response:**
```json
{
    "id": "bolt-1",
    "name": "Bolts",
    "type": "RAW"
}
```

---

**Request to register an assembled part:**
```json
{
    "name": "Gearbox",
    "type": "ASSEMBLED",
    "parts": [
    	{"id": "bolt-1", "quantity": 4},
	{"id": "shaft-1", "quantity": 2}
    ]
}

```

**Response:**
```json
{
    "id": "gearbox-1",
    "name": "Gearbox",
    "type": "ASSEMBLED",
    "parts": [
    	{"id": "bolt-1", "quantity": 4},
	{"id": "shaft-1", "quantity": 2}
    ]
}
```


### Add parts to inventory.
API to add parts to inventory.

#### Add Raw Part
- Add raw parts to inventory. 
- Example: Add Bolt with quantity 1000.

#### Add Assembled Part
- Add assembled parts to inventory.
- Automatically deduct the required quantities of constituent parts from the inventory.
- If any constituent part has insufficient quantity, the operation must fail gracefully (no partial updates).
- Example: Add Gearbox requiring 2 Shafts and 4 Bolts.


`[POST] /api/part/<partId>`

**Request:**
```json
{
    "quantity": 4
}
```

**Response:**
```json
{
    "status": "SUCCESS"
}
```

OR

```json
{
    "status": "FAILED",
    "message": "Insufficient quantity - shaft-01"
}
```


## System Requirements
- Support any level of nested assemblies (sub-assemblies of sub-assemblies, etc.).  
- Prevent circular dependencies (e.g., A → B → A). 
- Ensure atomic operations (use transactions to maintain data consistency). 
- Design clean, robust, and maintainable code. 
- Optimize for performance.

## Contact

For any questions, drop a WhatsApp message at: +91-9870653236

## Best of Luck!
