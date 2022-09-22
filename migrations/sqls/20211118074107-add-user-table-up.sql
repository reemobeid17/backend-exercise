CREATE TABLE public."user"
(
    id SERIAL PRIMARY KEY,
    first_name VARCHAR NOT NULL,
    last_name VARCHAR NOT NULL,
    email VARCHAR NOT NULL UNIQUE,
    password VARCHAR NOT NULL,
    role role_types NOT NULL,
    created_at TIMESTAMPTZ NOT NULL
);
