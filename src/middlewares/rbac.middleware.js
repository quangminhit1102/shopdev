const { ForbiddenError } = require("../core/error.response");
const rbac = require("./role.middleware"); // Import the AccessControl instance
const { roleList } = require("../services/rbac.service");

const grantAccess = (action, resource) => {
  return async (req, res, next) => {
    try {
      rbac.setGrants(await roleList({ userId: req.userId })); // Set the grants based on the user's roles
      console.log("RBAC Grants:", rbac.getGrants()); // Debugging line to check the grants
      
      const role_name = req.query.role || "guest"; // Default to 'guest' if no role is provided
      const permission = rbac.can(role_name)[action](resource);

      if (!permission.granted) {
        throw new ForbiddenError(
          `You don't have enough permission to perform this action`
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = {
  grantAccess,
};
