# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository status

This repository (`umbrella-reminder`) is currently **empty** — it has no commits, no source files, and no configuration (no `package.json`, `README.md`, build tooling, or CI setup). There is no existing architecture, command set, or convention to document yet.

## Working in this repository

Since there is no established stack or structure yet, before adding code:

- Confirm with the user what language/framework/platform the "umbrella reminder" project should use (e.g. web app, mobile app, CLI, browser extension) if it isn't already clear from the conversation.
- Once a stack is chosen and initial files are added, update this CLAUDE.md with:
  - The actual build/lint/test/run commands (and how to run a single test).
  - The high-level architecture (how the pieces fit together, e.g. weather-data source, reminder/notification logic, scheduling, storage).
  - Any project-specific conventions established in code.

Do not scaffold a project structure speculatively — wait for direction on the intended stack before generating source files.
