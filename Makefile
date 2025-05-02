.PHONY: ci

ci:
	pnpm install --frozen-lockfile

generate:
	npx prisma generate
