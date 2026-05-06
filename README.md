Repo for reproducing bugs

## Bug Reproductions

### playwright-har-duplicate-entries

Branch: `playwright-har-duplicate-entries`

**Issue**: When `page.routeFromHAR(harPath, {update: true})` records network requests with transient failures, both the failed attempt and the successful retry are recorded as separate entries. During replay, the first entry is used, which may be the malformed/failed response, causing pages to load with empty/missing content.

**Status**: Minimal reproduction created showing exact conditions that trigger the bug

See [REPRODUCTION.md](./REPRODUCTION.md) for setup and execution instructions.
