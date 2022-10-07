## Description:

- Create a **PostgreSQL** database with a `user` table and `role` type
- Create signup / login APIs
- Create CRUD operations for user model with different permissions

## Instructions for QA:

### Backend

1. Change directory `cd ./exercise2-backend`
2. Run `yarn` to install dependencies
3. Create a `.env` file in the root directory and copy the enviroment variables from `.env.example`
4. Replace the variables with your database credentials
5. Run `docker-compose up` to start all the containers
6. Connect your PostgreSQL database to your local PgAdmin
7. Open a terminal and run `redis-cli` to access cached data using Redis commands
8. Open a terminal and run `docker exec -it mongoDB bash` then inside the bash run `mongosh` to access MongoDB shell. Try `db.logs.find()` to retrieve all logs
9. Import `postman.json` into **Postman**
10. Test out the APIs
