import Logs from "../mongo/logs";

const saveLogs = async (
  title = "New Default Log",
  description = "A new request was made",
  successful = false
) => {
  const log = {
    title,
    description,
    successful,
    createdAt: new Date(),
  };

  const logs = new Logs(log);
  await logs.save();
};

export default saveLogs;
