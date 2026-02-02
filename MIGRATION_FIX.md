# Credentials Migration Fix

## Problem
The extension was throwing the error:
```
TypeError: e.value.find is not a function
```

This occurred because `credentials.value` was not always an array, breaking `.find()` method calls.

## Root Causes Identified

1. **No migration from old Angular version**: The old version (Angular) stored credentials in `localStorage` with different keys and field naming:
   - Old keys: `'credential'` (single) and `'allCredentials'` (multiple)
   - Old field names: `access_key_id`, `secret_access_key`, `s3_region`, `s3_bucket`
   - New keys: `'mys3browser_credentials'` in `chrome.storage.local`
   - New field names: `accessKeyId`, `secretAccessKey`, `region`, `bucket`

2. **Corrupted data**: Single credential object stored instead of array in `chrome.storage.local`

3. **Old bug in Angular code**: The old `setAllCredential()` function could store a single object instead of an array

## Solutions Implemented

### 1. Migration Logic (`src/app/stores/credentials.ts`)

Added comprehensive migration that handles:

- **Old localStorage format**: Automatically detects and converts old Angular data
- **Field name conversion**: Converts snake_case to camelCase
- **Array normalization**: Ensures single objects are converted to arrays
- **Duplicate detection**: Merges data from both old keys without duplicates
- **Cleanup**: Removes old localStorage data after successful migration

### 2. Defensive Array Checks

Added validation in all functions that use array methods:
- `activeCredential` computed property
- `saveCredential()`
- `deleteCredential()`
- `setActiveCredential()`
- `getCredentialByName()`

### 3. Comprehensive Unit Tests (`src/app/stores/credentials.test.ts`)

Created 12 unit tests covering all scenarios:
- ✅ Empty storage (new install)
- ✅ Valid array format
- ✅ Single object instead of array (corrupted)
- ✅ Old localStorage single credential
- ✅ Old localStorage multiple credentials
- ✅ Old localStorage single object in allCredentials (old bug)
- ✅ Both old keys present (with/without duplicates)
- ✅ Defensive checks for corrupted data

## Running Tests

```bash
npm test              # Run tests in watch mode
npm test -- --run     # Run tests once
npm run test:ui       # Run tests with UI
```

## Migration Behavior

When a user opens the extension after this update:

1. **First load**: Checks for old data in localStorage
2. **Migration**: Converts old format to new format if found
3. **Cleanup**: Removes old localStorage keys
4. **Save**: Stores migrated data in new format
5. **Normal operation**: Uses new format going forward

## Testing the Fix

To test locally:
1. Build: `npm run build`
2. Load unpacked extension from `dist/` directory
3. Extension will automatically migrate any old credentials
4. Check console for migration log messages

## Backward Compatibility

- ✅ New installs work normally
- ✅ Existing Vue 3 users unaffected
- ✅ Old Angular users get automatic migration
- ✅ Corrupted data gets fixed automatically
