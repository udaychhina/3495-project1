# 3495-project1

## Building docker services.

Build all services.
```bash
docker compose up -d
```

Bring down all services.
```bash
docker compose down
```

Bring down all services and remove volumes and orphan containers.
```bash
docker compose down -v --remove-orphans
```


## Testing docker services with curl.

1. Post to mysql service.
```bash
curl -X POST http://localhost:3000/submit \
-H "Content-Type: application/json" \
-d '{"student_name": "JohnDoe", "grade": 85}'
```

2. Login to nodejs service.
```bash
curl -X POST http://localhost:3000/login \
-H "Content-Type: application/json" \
-d '{"username": "admin", "password": "password123"}'
```

3. Authentication with python service.
```bash
# correct credentials
curl -X POST http://localhost:5000/auth \
-H "Content-Type: application/json" \
-d '{"username": "admin", "password": "password123"}'

# incorrect credentials
curl -X POST http://localhost:5000/auth \
-H "Content-Type: application/json" \
-d '{"username": "admin", "password": "password"}'
```

4. Testing mongodb service.
```bash
curl http://localhost:6000/calculate
```

5. Show results from mongodb service.
```bash
curl http://localhost:4000/show_results \
-H "Content-Type: application/json" \
-d '{"username": "admin", "password": "password123"}'
```
