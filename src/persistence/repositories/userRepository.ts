import User from "../../models/user";
import pool from "../connectionPool";
import dbRowToUser from "../../util/dbRowToUser";

interface UserRepository {
  getUsers: () => Promise<User[]>;
  getUsersByPage: (page: number, pageSize: number) => Promise<User[]>;
  getUserByEmail: (email: string) => Promise<User | null>;
  getUserById: (id: number) => Promise<User | null>;
  insertUser: (user: User) => Promise<User>;
  updateUser: (id: number, user: User) => Promise<User>;
  deleteUser: (id: number) => Promise<any>;
}

const userRepository = {} as UserRepository;

userRepository.getUsers = async () => {
  const queryText = `SELECT id, first_name, last_name, email, role FROM public.user ORDER BY created_at DESC`;
  const res = await pool.query(queryText);
  return res.rows.map((row) => dbRowToUser(row));
};

userRepository.getUsersByPage = async (page: number, pageSize: number) => {
  const queryText = `SELECT id, first_name, last_name, email, role FROM public.user ORDER BY created_at DESC LIMIT $1 OFFSET $2`;
  const res = await pool.query(queryText, [pageSize, page * pageSize]);
  return res.rows.map((row) => dbRowToUser(row));
};

userRepository.getUserByEmail = async (email: string) => {
  const queryText = `SELECT id, first_name, last_name, email, password, role FROM public.user WHERE email = $1`;
  const res = await pool.query(queryText, [email]);
  if (res.rows[0]) {
    return dbRowToUser(res.rows[0]);
  } else {
    return null;
  }
};

userRepository.getUserById = async (id: number) => {
  const queryText = `SELECT id, first_name, last_name, email, role FROM public.user WHERE id = $1`;
  const res = await pool.query(queryText, [id]);
  if (res.rows[0]) {
    return dbRowToUser(res.rows[0]);
  } else {
    return null;
  }
};

userRepository.insertUser = async (user: User) => {
  const queryText = `INSERT INTO public.user (first_name, last_name, email, password, role, created_at) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, first_name, last_name, email, role`;
  const values = [
    user.firstName,
    user.lastName,
    user.email,
    user.password,
    "user",
    new Date(),
  ];
  const res = await pool.query(queryText, values);
  return dbRowToUser(res.rows[0]);
};

userRepository.updateUser = async (id: number, user: User) => {
  const queryText = `UPDATE public.user SET first_name = COALESCE($1, first_name), last_name = COALESCE($2, last_name), email = COALESCE($3, email), password = COALESCE($4, password), role = COALESCE($5, role) WHERE id = $6 RETURNING id, first_name, last_name, email, role`;
  const res = await pool.query(queryText, [
    user.firstName,
    user.lastName,
    user.email,
    user.password,
    user.role,
    id,
  ]);
  return dbRowToUser(res.rows[0]);
};

userRepository.deleteUser = async (id: number) => {
  const queryText = `DELETE FROM public.user WHERE id = $1`;
  return await pool.query(queryText, [id]);
};

export default userRepository;
