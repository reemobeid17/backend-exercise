import userRepository from "../persistence/repositories/userRepository";
import redisClient from "../redis/redisClient";

const getCachedUsers = async (
  usersId: string[],
  page?: number,
  pageSize?: number
) => {
  if (page !== undefined && pageSize && page >= 0 && pageSize >= 0) {
    const start = page * pageSize;
    const end = start + pageSize;
    usersId = usersId.slice(start, end);
  }

  const users = await Promise.all(
    usersId.map(async (value) => {
      const user = await redisClient.hGetAll(value);
      if (Object.keys(user).length) {
        return user;
      } else {
        const id = parseInt(value.split(":")[1]);
        const fetchedUser = await userRepository.getUserById(id);
        await redisClient.hSet(`user:${id}`, fetchedUser as any);
        await redisClient.expire(`user:${id}`, 300);
        return fetchedUser;
      }
    })
  );

  return users;
};

export default getCachedUsers;
