require("dotenv").config();
const pagination = (queryParams) => {
  const page = Number(queryParams.page) || Number(process.env.PAGE);
  const limit = Number(queryParams.limit) || Number(process.env.LIMIT);
  const skip = (page - 1) * limit;

  return { limit, skip };
};

module.exports = pagination;
