.PHONY: generate

generate:
	buf dep update
	buf lint
	buf generate --include-imports
	bun run scripts/generate-openapi.ts web
