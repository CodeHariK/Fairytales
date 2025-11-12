.PHONY: generate

generate:
	buf dep update
	buf lint
	buf generate --include-imports
