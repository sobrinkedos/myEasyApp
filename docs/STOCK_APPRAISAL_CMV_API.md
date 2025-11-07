# Stock Appraisal & CMV API Documentation

## Overview

This document provides comprehensive API documentation for the Stock Appraisal (Conferência de Estoque) and CMV (Custo de Mercadoria Vendida) modules.

**Base URL**: `/api/v1`

**Authentication**: All endpoints require JWT authentication via `Authorization: Bearer <token>` header.

---

## Stock Appraisal Endpoints

### Create Appraisal

Creates a new stock appraisal and captures theoretical stock.

**Endpoint**: `POST /appraisals`

**Authorization**: Authenticated users

**Request Body**:
```json
{
  "date": "2025-11-06T10:00:00Z",
  "type": "daily",
  "notes": "Monthly inventory check"
}
```

**Fields**:
- `date` (Date, required): Date of the appraisal
- `type` (string, required): Type of appraisal - `daily`, `weekly`, or `monthly`
- `notes` (string, optional): General observations

**Response**: `201 Created`
```json
{
  "id": "uuid",
  "date": "2025-11-06T10:00:00Z",
  "type": "daily",
  "status": "pending",
  "userId": "uuid",
  "totalTheoretical": "15000.00",
  "totalPhysical": "0.00",
  "totalDifference": "0.00",
  "accuracy": "0.00",
  "notes": "Monthly inventory check",
  "createdAt": "2025-11-06T10:00:00Z",
  "items": []
}
```

---

### List Appraisals

Retrieves a list of appraisals with optional filters.

**Endpoint**: `GET /appraisals`

**Authorization**: Authenticated users

**Query Parameters**:
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 20)
- `type` (string, optional): Filter by type - `daily`, `weekly`, `monthly`
- `status` (string, optional): Filter by status - `pending`, `completed`, `approved`
- `startDate` (Date, optional): Filter from date
- `endDate` (Date, optional): Filter to date

**Response**: `200 OK`
```json
{
  "data": [
    {
      "id": "uuid",
      "date": "2025-11-06T10:00:00Z",
      "type": "daily",
      "status": "approved",
      "accuracy": "96.50",
      "totalDifference": "-350.00",
      "createdAt": "2025-11-06T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "pages": 3
  }
}
```

---

### Get Appraisal by ID

Retrieves detailed information about a specific appraisal.

**Endpoint**: `GET /appraisals/:id`

**Authorization**: Authenticated users

**Response**: `200 OK`
```json
{
  "id": "uuid",
  "date": "2025-11-06T10:00:00Z",
  "type": "daily",
  "status": "approved",
  "userId": "uuid",
  "totalTheoretical": "15000.00",
  "totalPhysical": "14650.00",
  "totalDifference": "-350.00",
  "accuracy": "96.50",
  "notes": "Monthly inventory check",
  "approvedBy": "uuid",
  "approvedAt": "2025-11-06T15:00:00Z",
  "createdAt": "2025-11-06T10:00:00Z",
  "completedAt": "2025-11-06T14:00:00Z",
  "items": [
    {
      "ingredientId": "uuid",
      "theoreticalQuantity": "50.00",
      "physicalQuantity": "48.00",
      "difference": "-2.00",
      "differencePercentage": "-4.00",
      "unitCost": "25.00",
      "totalDifference": "-50.00",
      "reason": "Normal usage variance",
      "notes": "",
      "ingredient": {
        "id": "uuid",
        "name": "Tomato",
        "unit": "kg"
      }
    }
  ]
}
```

---

### Update Appraisal

Updates an appraisal's basic information.

**Endpoint**: `PUT /appraisals/:id`

**Authorization**: Authenticated users

**Request Body**:
```json
{
  "date": "2025-11-06T10:00:00Z",
  "type": "daily",
  "notes": "Updated notes"
}
```

**Response**: `200 OK` (same structure as Get Appraisal)

**Errors**:
- `400 Bad Request`: Cannot update approved appraisal
- `404 Not Found`: Appraisal not found

---

### Delete Appraisal

Deletes an appraisal (only if not approved).

**Endpoint**: `DELETE /appraisals/:id`

**Authorization**: Authenticated users

**Response**: `204 No Content`

**Errors**:
- `400 Bad Request`: Cannot delete approved appraisal
- `404 Not Found`: Appraisal not found

---

### Add Item to Appraisal

Adds an ingredient to the appraisal for counting.

**Endpoint**: `POST /appraisals/:id/items`

**Authorization**: Authenticated users

**Request Body**:
```json
{
  "ingredientId": "uuid",
  "physicalQuantity": "48.00",
  "reason": "Normal usage variance",
  "notes": "Checked twice"
}
```

**Response**: `201 Created`
```json
{
  "ingredientId": "uuid",
  "theoreticalQuantity": "50.00",
  "physicalQuantity": "48.00",
  "difference": "-2.00",
  "differencePercentage": "-4.00",
  "unitCost": "25.00",
  "totalDifference": "-50.00",
  "reason": "Normal usage variance",
  "notes": "Checked twice"
}
```

---

### Update Appraisal Item

Updates the physical quantity and notes for an item.

**Endpoint**: `PUT /appraisals/:id/items/:itemId`

**Authorization**: Authenticated users

**Request Body**:
```json
{
  "physicalQuantity": "49.00",
  "reason": "Recounted - found more",
  "notes": "Updated after recount"
}
```

**Response**: `200 OK` (same structure as Add Item)

---

### Remove Appraisal Item

Removes an ingredient from the appraisal.

**Endpoint**: `DELETE /appraisals/:id/items/:itemId`

**Authorization**: Authenticated users

**Response**: `204 No Content`

---

### Complete Appraisal

Marks the appraisal as completed (all items counted).

**Endpoint**: `POST /appraisals/:id/complete`

**Authorization**: Authenticated users

**Response**: `200 OK`
```json
{
  "id": "uuid",
  "status": "completed",
  "accuracy": "96.50",
  "completedAt": "2025-11-06T14:00:00Z"
}
```

**Errors**:
- `400 Bad Request`: Not all items have been counted

---

### Approve Appraisal

Approves the appraisal and adjusts theoretical stock to match physical count.

**Endpoint**: `POST /appraisals/:id/approve`

**Authorization**: Managers only

**Response**: `200 OK`
```json
{
  "id": "uuid",
  "status": "approved",
  "approvedBy": "uuid",
  "approvedAt": "2025-11-06T15:00:00Z"
}
```

**Errors**:
- `400 Bad Request`: Appraisal not completed
- `403 Forbidden`: User is not a manager

---

### Calculate Accuracy

Calculates the accuracy percentage for the appraisal.

**Endpoint**: `GET /appraisals/:id/accuracy`

**Authorization**: Authenticated users

**Response**: `200 OK`
```json
{
  "accuracy": "96.50",
  "totalTheoretical": "15000.00",
  "totalPhysical": "14650.00",
  "totalDifference": "-350.00",
  "classification": "yellow"
}
```

**Classification**:
- `green`: Accuracy > 95%
- `yellow`: Accuracy 90-95%
- `red`: Accuracy < 90%

---

## CMV Period Endpoints

### Create CMV Period

Creates a new CMV calculation period.

**Endpoint**: `POST /cmv/periods`

**Authorization**: Managers only

**Request Body**:
```json
{
  "startDate": "2025-11-01T00:00:00Z",
  "endDate": "2025-11-30T23:59:59Z",
  "type": "monthly"
}
```

**Fields**:
- `startDate` (Date, required): Period start date
- `endDate` (Date, required): Period end date
- `type` (string, required): Period type - `daily`, `weekly`, or `monthly`

**Response**: `201 Created`
```json
{
  "id": "uuid",
  "startDate": "2025-11-01T00:00:00Z",
  "endDate": "2025-11-30T23:59:59Z",
  "type": "monthly",
  "status": "open",
  "openingStock": "15000.00",
  "purchases": "0.00",
  "closingStock": "0.00",
  "cmv": "0.00",
  "revenue": "0.00",
  "cmvPercentage": "0.00",
  "createdAt": "2025-11-01T00:00:00Z"
}
```

**Errors**:
- `400 Bad Request`: Overlapping period exists or another period is already open

---

### List CMV Periods

Retrieves a list of CMV periods with optional filters.

**Endpoint**: `GET /cmv/periods`

**Authorization**: Authenticated users

**Query Parameters**:
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 20)
- `type` (string, optional): Filter by type
- `status` (string, optional): Filter by status - `open`, `closed`
- `startDate` (Date, optional): Filter from date
- `endDate` (Date, optional): Filter to date

**Response**: `200 OK`
```json
{
  "data": [
    {
      "id": "uuid",
      "startDate": "2025-11-01T00:00:00Z",
      "endDate": "2025-11-30T23:59:59Z",
      "type": "monthly",
      "status": "closed",
      "cmv": "12500.00",
      "cmvPercentage": "32.50",
      "revenue": "38500.00"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 12,
    "pages": 1
  }
}
```

---

### Get CMV Period by ID

Retrieves detailed information about a specific period.

**Endpoint**: `GET /cmv/periods/:id`

**Authorization**: Authenticated users

**Response**: `200 OK`
```json
{
  "id": "uuid",
  "startDate": "2025-11-01T00:00:00Z",
  "endDate": "2025-11-30T23:59:59Z",
  "type": "monthly",
  "status": "closed",
  "openingStock": "15000.00",
  "purchases": "12000.00",
  "closingStock": "14500.00",
  "cmv": "12500.00",
  "revenue": "38500.00",
  "cmvPercentage": "32.50",
  "createdAt": "2025-11-01T00:00:00Z",
  "closedAt": "2025-11-30T23:59:59Z",
  "products": [
    {
      "productId": "uuid",
      "quantitySold": 150,
      "revenue": "3000.00",
      "cost": "900.00",
      "cmv": "900.00",
      "margin": "2100.00",
      "marginPercentage": "70.00",
      "product": {
        "id": "uuid",
        "name": "Burger"
      }
    }
  ]
}
```

---

### Update CMV Period

Updates a period's basic information (only if open).

**Endpoint**: `PUT /cmv/periods/:id`

**Authorization**: Managers only

**Request Body**:
```json
{
  "endDate": "2025-11-30T23:59:59Z"
}
```

**Response**: `200 OK` (same structure as Get Period)

---

### Delete CMV Period

Deletes a period (only if open and no transactions).

**Endpoint**: `DELETE /cmv/periods/:id`

**Authorization**: Managers only

**Response**: `204 No Content`

---

### Close CMV Period

Closes the period and calculates final CMV.

**Endpoint**: `POST /cmv/periods/:id/close`

**Authorization**: Managers only

**Request Body**:
```json
{
  "closingAppraisalId": "uuid"
}
```

**Response**: `200 OK`
```json
{
  "id": "uuid",
  "status": "closed",
  "closingStock": "14500.00",
  "cmv": "12500.00",
  "cmvPercentage": "32.50",
  "closedAt": "2025-11-30T23:59:59Z"
}
```

**Errors**:
- `400 Bad Request`: Missing closing appraisal or appraisal not approved

---

### Calculate CMV

Calculates CMV for the period (preview before closing).

**Endpoint**: `GET /cmv/periods/:id/calculate`

**Authorization**: Authenticated users

**Response**: `200 OK`
```json
{
  "openingStock": "15000.00",
  "purchases": "12000.00",
  "closingStock": "14500.00",
  "cmv": "12500.00",
  "revenue": "38500.00",
  "cmvPercentage": "32.50",
  "grossMargin": "26000.00",
  "grossMarginPercentage": "67.50"
}
```

---

### Get CMV by Product

Retrieves CMV breakdown by product for the period.

**Endpoint**: `GET /cmv/periods/:id/products`

**Authorization**: Authenticated users

**Query Parameters**:
- `sortBy` (string, optional): Sort field - `cmv`, `revenue`, `margin` (default: `cmv`)
- `order` (string, optional): Sort order - `asc`, `desc` (default: `desc`)

**Response**: `200 OK`
```json
{
  "products": [
    {
      "productId": "uuid",
      "productName": "Burger",
      "quantitySold": 150,
      "revenue": "3000.00",
      "cost": "900.00",
      "cmv": "900.00",
      "margin": "2100.00",
      "marginPercentage": "70.00"
    }
  ],
  "summary": {
    "totalRevenue": "38500.00",
    "totalCMV": "12500.00",
    "totalMargin": "26000.00",
    "averageMarginPercentage": "67.50"
  }
}
```

---

### Generate CMV Report

Generates a comprehensive CMV report for the period.

**Endpoint**: `GET /cmv/periods/:id/report`

**Authorization**: Authenticated users

**Response**: `200 OK`
```json
{
  "period": {
    "id": "uuid",
    "startDate": "2025-11-01T00:00:00Z",
    "endDate": "2025-11-30T23:59:59Z",
    "type": "monthly"
  },
  "summary": {
    "openingStock": "15000.00",
    "purchases": "12000.00",
    "closingStock": "14500.00",
    "cmv": "12500.00",
    "revenue": "38500.00",
    "cmvPercentage": "32.50",
    "grossMargin": "26000.00",
    "grossMarginPercentage": "67.50"
  },
  "byCategory": [
    {
      "category": "Main Dishes",
      "cmv": "8000.00",
      "revenue": "25000.00",
      "cmvPercentage": "32.00"
    }
  ],
  "topProducts": [
    {
      "productName": "Burger",
      "cmv": "900.00",
      "revenue": "3000.00"
    }
  ]
}
```

---

## Report Endpoints

### Generate CMV Report

Generates a CMV report with optional period comparison.

**Endpoint**: `GET /reports/cmv`

**Authorization**: Authenticated users

**Query Parameters**:
- `periodId` (string, required): Period ID
- `compareWith` (string, optional): Another period ID for comparison

**Response**: `200 OK` (same structure as period report)

---

### Compare Periods

Compares multiple CMV periods.

**Endpoint**: `GET /reports/cmv/compare`

**Authorization**: Authenticated users

**Query Parameters**:
- `periodIds` (string[], required): Array of period IDs to compare

**Response**: `200 OK`
```json
{
  "periods": [
    {
      "id": "uuid",
      "startDate": "2025-10-01T00:00:00Z",
      "endDate": "2025-10-31T23:59:59Z",
      "cmv": "11000.00",
      "cmvPercentage": "30.00"
    },
    {
      "id": "uuid",
      "startDate": "2025-11-01T00:00:00Z",
      "endDate": "2025-11-30T23:59:59Z",
      "cmv": "12500.00",
      "cmvPercentage": "32.50"
    }
  ],
  "comparison": {
    "cmvVariation": "13.64",
    "cmvPercentageVariation": "2.50",
    "trend": "increasing"
  }
}
```

---

### Export CMV Report PDF

Exports a CMV report as PDF.

**Endpoint**: `GET /reports/cmv/export`

**Authorization**: Authenticated users

**Query Parameters**:
- `periodId` (string, required): Period ID

**Response**: `200 OK`
- Content-Type: `application/pdf`
- Binary PDF file

---

### Generate Appraisal Report

Generates a detailed appraisal report.

**Endpoint**: `GET /reports/appraisals`

**Authorization**: Authenticated users

**Query Parameters**:
- `appraisalId` (string, required): Appraisal ID

**Response**: `200 OK`
```json
{
  "appraisal": {
    "id": "uuid",
    "date": "2025-11-06T10:00:00Z",
    "type": "daily",
    "accuracy": "96.50"
  },
  "summary": {
    "totalItems": 45,
    "itemsCounted": 45,
    "totalTheoretical": "15000.00",
    "totalPhysical": "14650.00",
    "totalDifference": "-350.00"
  },
  "criticalItems": [
    {
      "ingredientName": "Beef",
      "differencePercentage": "-15.00",
      "totalDifference": "-300.00"
    }
  ],
  "distribution": {
    "green": 38,
    "yellow": 5,
    "red": 2
  }
}
```

---

### Generate Accuracy Trend

Generates accuracy trend over time.

**Endpoint**: `GET /reports/accuracy`

**Authorization**: Authenticated users

**Query Parameters**:
- `startDate` (Date, required): Start date
- `endDate` (Date, required): End date

**Response**: `200 OK`
```json
{
  "trend": [
    {
      "date": "2025-11-01T00:00:00Z",
      "accuracy": "95.50"
    },
    {
      "date": "2025-11-06T00:00:00Z",
      "accuracy": "96.50"
    }
  ],
  "average": "96.00",
  "improvement": "1.00"
}
```

---

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "error": "Validation error",
  "message": "Invalid request data",
  "details": [
    {
      "field": "date",
      "message": "Date is required"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "Invalid or missing authentication token"
}
```

### 403 Forbidden
```json
{
  "error": "Forbidden",
  "message": "Insufficient permissions to perform this action"
}
```

### 404 Not Found
```json
{
  "error": "Not found",
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error",
  "message": "An unexpected error occurred"
}
```

---

## Rate Limiting

All endpoints are rate-limited to 100 requests per minute per IP address.

**Rate Limit Headers**:
- `X-RateLimit-Limit`: Maximum requests per window
- `X-RateLimit-Remaining`: Remaining requests in current window
- `X-RateLimit-Reset`: Time when the rate limit resets (Unix timestamp)

---

## Pagination

List endpoints support pagination with the following query parameters:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)

**Pagination Response**:
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "pages": 3
  }
}
```

---

**Version**: 1.0  
**Last Updated**: 06/11/2025
