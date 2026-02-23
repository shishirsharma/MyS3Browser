# Testing Guide

## Unit Tests

Run unit tests with Vitest:

```bash
npm test
```

Run tests with UI:

```bash
npm run test:ui
```

## Test Structure

Tests are colocated with components in `__tests__` directories:

```
src/app/components/
├── FileList.vue
├── FileRow.vue
├── __tests__/
│   ├── FileList.spec.ts
│   └── FileRow.spec.ts
```

## Integration Tests

Integration tests validate the Chrome extension behavior:

```bash
npm test -- --run
```

## Writing Tests

Example test:

```typescript
import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import MyComponent from './MyComponent.vue';

describe('MyComponent', () => {
  it('renders properly', () => {
    const wrapper = mount(MyComponent);
    expect(wrapper.text()).toContain('Hello');
  });
});
```

## Testing the Extension

To test the extension manually:

1. Build: `npm run build`
2. Load unpacked extension in Chrome
3. Test S3 browser functionality with test credentials
4. Verify analytics tracking (dev console)
