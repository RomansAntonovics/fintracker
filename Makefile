# Main commands:
#   make up    — start containers (with rebuild)
#   make down  — stop and remove containers
#   make logs  — follow containers logs
#   make ps    — show running containers

# Start containers (with rebuild)
up:
	docker compose -f infra/docker-compose.yaml up -d --build

# Stop and remove containers
down:
	docker compose -f infra/docker-compose.yaml down

# Follow containers logs
logs:
	docker compose -f infra/docker-compose.yaml logs -f

# Show running containers
ps:
	docker compose -f infra/docker-compose.yaml ps
