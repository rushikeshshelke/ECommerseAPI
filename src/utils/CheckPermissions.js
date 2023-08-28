const checkPermissions = (requestedUser, userId) => {
  if (requestedUser.role === "admin" || requestedUser.userId === userId) {
    return true;
  }
  return false;
};

module.exports = checkPermissions;
