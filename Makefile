build:
	docker compose build --no-cache

up:
	docker compose up -d

shell-web:
	docker exec -it tax-account-new-web-1 bash

shell-db:
	docker exec -it tax-account-new-db-1 bash

clean:
	docker rm -f $$(docker ps -aq)

prune:
	docker volume rm $$(docker volume ls -q)
