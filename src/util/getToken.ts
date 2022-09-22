import jwt from "jsonwebtoken";

const getToken = (id: number, email: string, role: string) => {
  try {
    const token = jwt.sign(
      {
        id,
        email,
        role,
      },
      process.env.JWT_SECRET!,
      {
        expiresIn: "24h",
      }
    );
    return token;
  } catch (err) {
    return err;
  }
};

export default getToken;
