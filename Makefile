up:
	docker compose -f infra/docker-compose.yaml up -d --build

down:
	docker compose -f infra/docker-compose.yaml down

logs:
	docker compose -f infra/docker-compose.yaml logs -f

ps:
	docker compose -f infra/docker-compose.yaml ps
