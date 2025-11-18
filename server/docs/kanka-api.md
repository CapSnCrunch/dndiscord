# Kanka API Documentation

## Overview

Kanka provides a RESTful API for interacting with campaign data. The API allows access to campaigns, entities (characters, locations, items, etc.), and various campaign-related resources.

## Base URL

```
https://api.kanka.io/1.0/
```

## Authentication

- **Type:** OAuth 2.0 Personal Access Token
- **Header:** `Authorization: Bearer {token}`
- **Content-Type:** `Content-type: application/json`
- **Token Generation:** Profile → API settings → Create New Token
- **Note:** Token is only shown once when created, store securely

## Rate Limits

- **Free:** 30 requests per minute per client
- **Subscribers:** 90 requests per minute per client

## Key Endpoints

### Campaigns

- `GET /campaigns` - List all campaigns accessible to the user
- `GET /campaigns/{id}` - Get single campaign details (includes `entry_parsed` with entity links)
- `GET /campaigns/{id}/roles` - Get all roles for a campaign

### Core Objects

The API provides endpoints for various entity types:
- Characters
- Locations
- Families
- Organisations
- Items
- Notes
- Events
- Calendars
- Timelines
- Creatures
- Races
- Quests
- Maps (with Markers, Groups, Layers)
- Journals
- Abilities
- Tags
- Conversations
- Dice Rolls

## Response Format

### Paginated Responses

```json
{
  "data": [...],
  "links": {
    "first": "...",
    "last": "...",
    "prev": null,
    "next": null
  },
  "meta": {
    "current_page": 1,
    "from": 1,
    "last_page": 1,
    "per_page": 15,
    "to": 3,
    "total": 3
  }
}
```

### Single Resource Responses

```json
{
  "data": {
    "id": 1,
    "name": "...",
    ...
  }
}
```

## Additional Features

- **Search endpoints** available
- **Pagination** supported on list endpoints
- **Filters** can be applied to queries
- **Entity mentions** in entries (e.g., `[entity:123]`) are parsed into HTML links in `entry_parsed`

## Documentation

Full API documentation: https://app.kanka.io/api-docs/1.0/

