# Trading Journal API

## Docker Local

### Local Postgres

`docker run -d --name trading-journal-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_USER=postgres -e POSTGRES_DB=trading-journal -p 5432:5432 -d postgres:13.3-alpine`

### Apply Migrations

`npx prisma migrate dev`

## Prisma

### Migration

`npx prisma migrate dev --name <NAME>`

### Generate Prisma Client

`npx prisma generate`

### Studio

`npx prisma studio`

## Docker

### Build

`docker build -t allanweber/trading-journal-api:<version> -f Dockerfile .`

### Run

`docker run -p 8080:8080 -e KINDE_DOMAIN='<KIND-DOMAIN>' -e DATABASE_URL='<POSTGRES_URL>' allanweber/trading-journal-api:<version>`
