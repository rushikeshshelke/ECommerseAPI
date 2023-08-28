require("dotenv").config();
const createQueryObject = (queryParamsObject) => {
  let queryObject = {};
  for (let key in queryParamsObject) {
    if (process.env.EXCLUDE_QUERY_PARAMS.includes(key)) {
      continue;
    }
    if (key && queryParamsObject[key] !== "") {
      queryObject[key] = queryParamsObject[key];
    }
  }
  return queryObject;
};

module.exports = createQueryObject;
