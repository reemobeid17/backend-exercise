import User from "../models/user";

const dbRowToUser = (dbRow: any): User => {
  return {
    id: dbRow.id,
    firstName: dbRow.first_name,
    lastName: dbRow.last_name,
    email: dbRow.email,
    password: dbRow.password ? dbRow.password : "",
    role: dbRow.role,
    createdAt: dbRow.created_at ? dbRow.created_at : "",
  } as User;
};

export default dbRowToUser;
