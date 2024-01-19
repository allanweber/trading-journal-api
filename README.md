# trading-journal-api

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
