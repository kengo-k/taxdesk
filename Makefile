build:
	docker compose build --no-cache

up:
	docker compose up -d

shell:
	docker exec -it tax-account-new-web-1 bash

clean:
	docker rm -f $$(docker ps -aq)
