# Test Selectors Quick Reference

This document provides a quick reference for all test selectors available in the application.

## General Principles

1. **Primary Selector**: Use `data-testid` attributes (most stable)
2. **Secondary Selector**: Use semantic CSS classes (stable)
3. **Tertiary Selector**: Use ARIA labels (for accessibility testing)
4. **Last Resort**: Use text content (least stable)

## Complete Selector List

### App Component

| Element | data-testid | CSS Class | Description |
|---------|-------------|-----------|-------------|
| Main container | `app` | - | Root application container |

### KanbanBoard Component

#### Header Section

| Element | data-testid | CSS Class | Description |
|---------|-------------|-----------|-------------|
| Board container | `kanban-board` | - | Main board container |
| Header | `board-header` | - | Header section |
| Title | `board-title` | - | Board title |
| Subtitle | `board-subtitle` | - | Board subtitle/description |
| Theme toggle | `theme-toggle-button` | `theme-toggle-button` | Dark/light mode toggle |

#### New Task Form

| Element | data-testid | CSS Class | Description |
|---------|-------------|-----------|-------------|
| Form container | `new-task-form` | - | New task form wrapper |
| Title input | `new-task-title-input` | `new-task-title-input` | Task title input field |
| Description input | `new-task-description-input` | `new-task-description-input` | Task description textarea |
| Deadline input | `new-task-deadline-input` | `new-task-deadline-input` | Task deadline datetime input |
| Add button | `add-task-button` | `add-task-button` | Submit new task button |

#### Columns

| Element | data-testid | CSS Class | Description |
|---------|-------------|-----------|-------------|
| Column (todo) | `column-todo` | - | Todo column container |
| Column (in progress) | `column-in_progress` | - | In Progress column container |
| Column (done) | `column-done` | - | Done column container |
| Column title | `column-title-{status}` | - | Column header title |
| Column count | `column-count-{status}` | - | Task count badge |
| Column content | `column-content-{status}` | `kanban-column` | Drop zone area |
| Empty state | `empty-column-{status}` | - | Empty column message |

**Note**: `{status}` can be: `todo`, `in_progress`, or `done`

#### Edit Modal

| Element | data-testid | CSS Class | Description |
|---------|-------------|-----------|-------------|
| Modal overlay | `edit-task-modal` | - | Modal background overlay |
| Modal content | `edit-task-modal-content` | - | Modal content container |
| Title input | `edit-task-title-input` | `edit-task-title-input` | Edit task title input |
| Description input | `edit-task-description-input` | `edit-task-description-input` | Edit task description textarea |
| Deadline input | `edit-task-deadline-input` | `edit-task-deadline-input` | Edit task deadline input |
| Save button | `save-task-button` | `save-task-button` | Save changes button |
| Cancel button | `cancel-edit-button` | `cancel-edit-button` | Cancel editing button |

### TaskCard Component

| Element | data-testid | CSS Class | Description |
|---------|-------------|-----------|-------------|
| Card container | `task-card-{id}` | `task-card` | Task card wrapper |
| Title | `task-title` | - | Task title text |
| Description | `task-description` | - | Task description text |
| Deadline | `task-deadline` | - | Task deadline (if present) |
| Updated date | `task-updated-date` | - | Last updated timestamp |
| Edit button | `task-edit-button-{id}` | `task-edit-button` | Edit task button |
| Delete button | `task-delete-button-{id}` | `task-delete-button` | Delete task button |

**Note**: `{id}` is the unique task ID

## Usage Examples

### Vitest / Testing Library

```typescript
import { render, screen, fireEvent } from '@testing-library/react';

// Get by test ID
const button = screen.getByTestId('add-task-button');

// Get by CSS class
const cards = document.querySelectorAll('.task-card');

// Get by ARIA label
const editButton = screen.getByRole('button', { name: /edit task/i });

// Interact with elements
fireEvent.click(button);
fireEvent.change(screen.getByTestId('new-task-title-input'), {
    target: { value: 'New Task' }
});
```

### Playwright

```typescript
import { test, expect } from '@playwright/test';

test('add new task', async ({ page }) => {
    // Navigate to app
    await page.goto('http://localhost:5173');

    // Fill form using test IDs
    await page.getByTestId('new-task-title-input').fill('New Task');
    await page.getByTestId('new-task-description-input').fill('Description');
    await page.getByTestId('add-task-button').click();

    // Verify task was added
    await expect(page.locator('.task-card')).toHaveCount(1);
});

test('edit task', async ({ page }) => {
    // Click edit button for specific task
    await page.getByTestId('task-edit-button-1').click();

    // Modal should be visible
    await expect(page.getByTestId('edit-task-modal')).toBeVisible();

    // Edit and save
    await page.getByTestId('edit-task-title-input').fill('Updated Task');
    await page.getByTestId('save-task-button').click();
});

test('drag and drop', async ({ page }) => {
    // Get source and target
    const task = page.getByTestId('task-card-1');
    const column = page.getByTestId('column-content-in_progress');

    // Perform drag and drop
    await task.dragTo(column);
});
```

### Cypress

```typescript
describe('Kanban Board', () => {
    it('should add a new task', () => {
        cy.visit('http://localhost:5173');

        // Fill form
        cy.getByTestId('new-task-title-input').type('New Task');
        cy.getByTestId('new-task-description-input').type('Description');
        cy.getByTestId('add-task-button').click();

        // Verify
        cy.get('.task-card').should('have.length', 1);
    });

    it('should delete a task', () => {
        cy.getByTestId('task-delete-button-1').click();
        cy.getByTestId('task-card-1').should('not.exist');
    });
});

// Custom command for getByTestId
Cypress.Commands.add('getByTestId', (testId) => {
    return cy.get(`[data-testid="${testId}"]`);
});
```

### Selenium (JavaScript)

```javascript
const { Builder, By, until } = require('selenium-webdriver');

async function testKanbanBoard() {
    const driver = await new Builder().forBrowser('chrome').build();

    try {
        await driver.get('http://localhost:5173');

        // Find elements by test ID
        const titleInput = await driver.findElement(
            By.css('[data-testid="new-task-title-input"]')
        );
        const addButton = await driver.findElement(
            By.css('[data-testid="add-task-button"]')
        );

        // Interact
        await titleInput.sendKeys('New Task');
        await addButton.click();

        // Wait for task card
        await driver.wait(
            until.elementLocated(By.css('.task-card')),
            5000
        );

        // Find by class
        const cards = await driver.findElements(By.css('.task-card'));
        console.log(`Found ${cards.length} tasks`);
    } finally {
        await driver.quit();
    }
}
```

## Dynamic Selectors

Some selectors include dynamic values:

### Task-specific selectors
Replace `{id}` with actual task ID:
- `task-card-1`
- `task-edit-button-1`
- `task-delete-button-1`

### Status-specific selectors
Replace `{status}` with: `todo`, `in_progress`, or `done`:
- `column-todo`
- `column-content-in_progress`
- `empty-column-done`

## Selector Patterns

### Finding all tasks
```typescript
// By test ID pattern
const tasks = screen.getAllByTestId(/^task-card-/);

// By CSS class
const tasks = document.querySelectorAll('.task-card');
```

### Finding buttons for specific task
```typescript
const taskId = '1';
const editButton = screen.getByTestId(`task-edit-button-${taskId}`);
const deleteButton = screen.getByTestId(`task-delete-button-${taskId}`);
```

### Finding column by status
```typescript
const status = 'todo';
const column = screen.getByTestId(`column-${status}`);
const columnContent = screen.getByTestId(`column-content-${status}`);
```

## Accessibility Testing

All interactive elements have ARIA labels:

```typescript
// Find by accessible name
screen.getByRole('button', { name: 'Add task' });
screen.getByRole('button', { name: 'Edit task Test Task' });
screen.getByRole('button', { name: 'Delete task Test Task' });
screen.getByRole('button', { name: 'Switch to dark mode' });

// Find inputs by label
screen.getByLabelText('Task title');
screen.getByLabelText('Task description');
screen.getByLabelText('Task deadline');
```

## Best Practices

1. **Prefer test IDs over CSS classes** for test stability
2. **Use CSS classes for bulk operations** (e.g., counting all cards)
3. **Use ARIA labels for accessibility testing**
4. **Avoid text-based selectors** as they change with translations
5. **Use dynamic selectors** for parameterized tests
6. **Combine selectors** when needed for specificity

## Troubleshooting

### Element not found
1. Check if element is rendered conditionally
2. Wait for element to appear (async operations)
3. Verify correct test ID spelling
4. Check if element is in shadow DOM

### Multiple elements found
1. Use more specific selector (include ID)
2. Use `getByTestId` instead of `getAllByTestId`
3. Add parent context to query

### Stale element reference
1. Re-query element after DOM updates
2. Use `waitFor` utilities
3. Check if element was removed and re-added
