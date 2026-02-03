# Testing Guide

This document describes the testing setup and best practices for the Kanban Task Tracker frontend application.

## Testing Stack

- **Vitest**: Fast unit test framework
- **Testing Library**: React component testing utilities
- **jsdom**: Browser environment simulation
- **MSW**: API mocking (configured but not yet implemented)

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

## Test Structure

Tests are located alongside their corresponding components:

```
src/
├── components/
│   ├── KanbanBoard.tsx
│   ├── KanbanBoard.test.tsx
│   ├── TaskCard.tsx
│   └── TaskCard.test.tsx
├── test/
│   ├── setup.ts          # Test environment setup
│   ├── test-utils.tsx    # Custom render utilities
│   └── mockData.ts       # Mock data for tests
└── App.test.tsx
```

## Test IDs and Selectors

All interactive elements have `data-testid` attributes for reliable testing:

### KanbanBoard Component

- `kanban-board` - Main board container
- `board-header` - Header section
- `board-title` - Title element
- `theme-toggle-button` - Dark/light mode toggle
- `new-task-form` - New task form container
- `new-task-title-input` - Task title input
- `new-task-description-input` - Task description textarea
- `new-task-deadline-input` - Task deadline input
- `add-task-button` - Add task button
- `column-{status}` - Column container (todo, in_progress, done)
- `column-title-{status}` - Column title
- `column-count-{status}` - Task count badge
- `column-content-{status}` - Column content area
- `empty-column-{status}` - Empty state message
- `edit-task-modal` - Edit modal overlay
- `edit-task-modal-content` - Edit modal content
- `edit-task-title-input` - Edit task title input
- `edit-task-description-input` - Edit task description textarea
- `edit-task-deadline-input` - Edit task deadline input
- `save-task-button` - Save task button
- `cancel-edit-button` - Cancel edit button

### TaskCard Component

- `task-card-{id}` - Task card container
- `task-title` - Task title
- `task-description` - Task description
- `task-deadline` - Task deadline (if present)
- `task-updated-date` - Last updated date
- `task-edit-button-{id}` - Edit button
- `task-delete-button-{id}` - Delete button

### CSS Classes

All components also have semantic CSS classes for styling and additional selection:

- `task-card` - Task card
- `task-edit-button` - Edit button
- `task-delete-button` - Delete button
- `kanban-column` - Column content area
- `theme-toggle-button` - Theme toggle
- `add-task-button` - Add task button
- `new-task-title-input` - New task title input
- `new-task-description-input` - New task description input
- `new-task-deadline-input` - New task deadline input
- `edit-task-title-input` - Edit task title input
- `edit-task-description-input` - Edit task description input
- `edit-task-deadline-input` - Edit task deadline input
- `save-task-button` - Save button
- `cancel-edit-button` - Cancel button

## Writing Tests

### Example: Testing a Component

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '../test/test-utils';
import { MyComponent } from './MyComponent';

describe('MyComponent', () => {
    it('renders correctly', () => {
        render(<MyComponent />);
        expect(screen.getByTestId('my-component')).toBeInTheDocument();
    });

    it('handles user interaction', () => {
        const mockHandler = vi.fn();
        render(<MyComponent onClick={mockHandler} />);
        
        fireEvent.click(screen.getByTestId('my-button'));
        expect(mockHandler).toHaveBeenCalledTimes(1);
    });
});
```

### Example: Testing with Mock Data

```typescript
import { createMockTask, mockTasks } from '../test/mockData';

it('displays task information', () => {
    const task = createMockTask({
        title: 'Test Task',
        status: 'todo',
    });

    render(<TaskCard task={task} />);
    expect(screen.getByTestId('task-title')).toHaveTextContent('Test Task');
});
```

### Example: Testing API Calls

```typescript
import { api } from '../services/api';

vi.mock('../services/api', () => ({
    api: {
        getTasks: vi.fn(),
    },
}));

it('loads tasks on mount', async () => {
    (api.getTasks as any).mockResolvedValue(mockTasks);
    
    render(<KanbanBoard />);
    
    await waitFor(() => {
        expect(api.getTasks).toHaveBeenCalledTimes(1);
    });
});
```

## Best Practices

1. **Use data-testid for selection**: Always prefer `data-testid` over class names or text content
2. **Test user behavior**: Focus on testing what users see and do, not implementation details
3. **Mock external dependencies**: Mock API calls and external services
4. **Use semantic queries**: Prefer `getByRole`, `getByLabelText` when appropriate
5. **Test accessibility**: Ensure proper aria-labels and roles are present
6. **Keep tests isolated**: Each test should be independent and not rely on others
7. **Use descriptive test names**: Test names should clearly describe what is being tested

## Coverage Goals

Aim for:
- **Statements**: > 80%
- **Branches**: > 75%
- **Functions**: > 80%
- **Lines**: > 80%

## Continuous Integration

Tests should run automatically on:
- Every commit
- Pull requests
- Before deployment

## Future Improvements

- [ ] Add E2E tests with Playwright or Cypress
- [ ] Implement MSW for API mocking
- [ ] Add visual regression testing
- [ ] Add performance testing
- [ ] Add accessibility testing with axe-core
