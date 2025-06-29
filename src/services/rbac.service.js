"use strict";
const ResourceModel = require("../models/resource.model");
const RoleModel = require("../models/role.model");
const { BadRequestError } = require("../core/error.response");

const createResource = async ({
  name = "profile",
  slug = "p00001",
  description,
}) => {
  try {
    // 1. Check if the resource already exists
    const existingResource = await ResourceModel.findOne({ slug });
    if (existingResource) {
      throw new BadRequestError(`Resource with slug ${slug} already exists`);
    }
    // 2. Create a new resource with the provided name, slug, and description
    const newResource = new ResourceModel({
      name,
      slug,
      description,
    });
    // 3. Save the new resource to the database
    await newResource.save();
  } catch (error) {
    console.error("Error creating resource:", error);
    throw new BadRequestError("Failed to create resource");
  }
};

const resourceList = async ({ userId, limit, offset, search }) => {
  try {
    //1. Check user is admin or not => In middaleware
    //2. Get list of resources
    const resources = await ResourceModel.aggregate([
      {
        $project: {
          _id: 0,
          name: "$src_name",
          slug: "$src_slug",
          description: "$src_description",
          createdAt: "$src_createdAt",
          updatedAt: "$src_updatedAt",
        },
      },
    ]);
    return resources;
  } catch (error) {
    console.error("Error listing resources:", error);
    throw new BadRequestError("Failed to list resources");
  }
};

const createRole = async ({
  name = "shop",
  slug = "s00001",
  description = "extend from shop or user",
  grants = [],
}) => {
  try {
    // 1. Check if the role already exists
    const existingRole = await RoleModel.findOne({ slug });
    if (existingRole) {
      throw new BadRequestError(`Role with slug ${slug} already exists`);
    }
    // 2. Create a new role with the provided name, slug, and description
    const newRole = await RoleModel.create({
      rol_name: name,
      rol_slug: slug,
      rol_description: description,
      rol_grants: grants,
    });
    return newRole;
  } catch (error) {
    console.error("Error creating role:", error);
    throw new BadRequestError("Failed to create role");
  }
};

const roleList = async () => {
  try {
  } catch (error) {
    console.error("Error listing roles:", error);
    throw new BadRequestError("Failed to list roles");
  }
};

module.exports = {
  createResource,
  resourceList,
  createRole,
  roleList,
};
