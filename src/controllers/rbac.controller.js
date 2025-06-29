"use strict";

const RbacService = require("../services/rbac.service");
const { OK, CREATED } = require("../core/success.response");

class RbacController {
  // Create a new resource
  static async createResource(req, res) {
    const resource = await RbacService.createResource(req.body);
    new CREATED({
      message: "Resource created successfully",
      metadata: resource,
    }).send(res);
  }

  // List all resources
  static async resourceList(req, res) {
    const resources = await RbacService.resourceList(req.query);
    new OK({
      message: "Resource list fetched successfully",
      metadata: resources,
    }).send(res);
  }

  // Create a new role
  static async createRole(req, res) {
    const role = await RbacService.createRole(req.body);
    new CREATED({
      message: "Role created successfully",
      metadata: role,
    }).send(res);
  }

  // List all roles
  static async roleList(req, res) {
    const roles = await RbacService.roleList();
    new OK({
      message: "Role list fetched successfully",
      metadata: roles,
    }).send(res);
  }
}

module.exports = RbacController;
