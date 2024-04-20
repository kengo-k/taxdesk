build:
	docker build -t tax-account-new .

start:
	docker run -p 3000:3000 --rm --name tax-account-new tax-account-new
