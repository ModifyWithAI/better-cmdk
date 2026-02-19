# Changelog

All notable changes to this package are documented in this file.

## 0.0.21 - 2026-02-19

### Breaking changes

- Replaced the declarative `commands` API with a unified `actions` API on `CommandMenu`.
  - `commands` -> `actions`
  - `commandsPlaceholder` -> `actionsPlaceholder`
  - `commandsAskAILabel` -> `actionsAskAILabel`
- Removed `CommandDefinition` from the public API surface.
- Updated `ExternalChat` to use `actions` instead of `agenticActions`.

### Changed

- Standardized action modeling around `CommandAction`.
- `CommandAction` now requires:
  - `description`
  - `execute`
- Added optional action metadata to support shared arrays with AI providers:
  - `inputSchema`
  - `approvalRequired`
  - `semanticKey`
  - `onSelect`
- Added action classification behavior:
  - no `inputSchema` -> command-like (direct execution)
  - has `inputSchema` -> argument-requiring (routed via chat invocation)
- Added development warnings for action overlap:
  - duplicate `name`
  - `semanticKey` collisions
- Updated action list typing to accept readonly arrays (`readonly CommandAction[]`) for better interoperability with typed tuples.

### Docs and prompts

- Rewrote integration guidance around one canonical, deduped `actions` list.
- Clarified that each library can ignore fields it does not use when sharing one action array.
- Clarified action ownership in integrations: better-cmdk is command-focused (no-argument actions), while modifywithai owns argument-requiring actions in the same shared array.
- Updated prompts to require extending an existing shared `actions` array in place instead of creating duplicate lists.
- Updated examples and docs to use exported component names consistently (`CommandInput`, `CommandList`, `CommandEmpty`, `CommandContent`).
- Reorganized Mintlify docs into a cleaner progression (`index` -> `quickstart` -> `extending`) with shorter, more structured pages.
