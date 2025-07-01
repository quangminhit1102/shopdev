"use strict";

const RbacService = require("../services/rbac.service");
const { OK, CREATED } = require("../core/success.response");

class RBACController {
  // Create a new resource
  createResource = async (req, res) => {
    new CREATED({
      message: "Resource created successfully",
      metadata: await RbacService.createResource({ ...req.body }),
    }).send(res);
  };

  // List all resources
  resourceList = async (req, res) => {
    const resources = await RbacService.resourceList(req.query);
    new OK({
      message: "Resource list fetched successfully",
      metadata: resources,
    }).send(res);
  };

  // Create a new role
  createRole = async (req, res) => {
    new CREATED({
      message: "Role created successfully",
      metadata: await RbacService.createRole(req.body),
    }).send(res);
  };

  // List all roles
  roleList = async (req, res) => {
    new OK({
      message: "Role list fetched successfully",
      metadata: await RbacService.roleList({
        userId: req.userId,
        ...req.query,
      }),
    }).send(res);
  };
}

module.exports = new RBACController();
