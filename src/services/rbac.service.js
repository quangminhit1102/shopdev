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
    const existingResource = await ResourceModel.findOne({ src_slug: slug });
    if (existingResource) {
      throw new BadRequestError(`Resource with slug ${slug} already exists`);
    }
    // 2. Create a new resource with the provided name, slug, and description
    const newResource = new ResourceModel({
      src_name: name,
      src_slug: slug,
      src_description: description,
    });
    // 3. Save the new resource to the database
    await newResource.save();
    return newResource;
  } catch (error) {
    console.error("Error creating resource:", error);
    throw error; // Re-throw the error to be handled by the caller
  }
};

const resourceList = async ({ userId, limit, offset, search }) => {
  try {
    //1. Check user is admin or not => In middaleware
    //2. Get list of resources
    const resources = await ResourceModel.aggregate([
      {
        $project: {
          _id: "$_id",
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
    throw error; // Re-throw the error to be handled by the caller
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
    throw error; // Re-throw the error to be handled by the caller
  }
};

const roleList = async ({
  userId = 0, // Assuming userId is used to check permissions - Admin
  limit = 10, // Default limit for pagination
  offset = 0, // Default offset for pagination
  search = "", // Search term for filtering roles
}) => {
  try {
    // 1. Check user is admin or not => In middleware
    // 2. Get list of roles with pagination and search
    const roles = await RoleModel.aggregate([
      {
        $unwind: "$rol_grants", // Unwind grants to flatten the array
      },
      {
        $lookup: {
          from: "Resources", // Assuming the collection name for resources is "resources"
          localField: "rol_grants.resource",
          foreignField: "_id",
          as: "resource",
        },
      },
      {
        $unwind: "$resource", // Unwind the resource array
      },
      {
        $project: {
          _id: 0,
          role: "$rol_name",
          resource: "$resource.src_name", // Resource name
          actions: "$rol_grants.actions", // Actions allowed on the resource
          attributes: "$rol_grants.attributes", // Attributes that can be accessed or modified
        },
      },
      {
        $unwind: "$actions", // Unwind actions to flatten the array
      },
      {
        $project: {
          role: 1,
          resource: 1,
          action: "$actions", // Action name
          attributes: 1, // Attributes that can be accessed or modified
        },
      },
    ]);
    return roles;
  } catch (error) {
    console.error("Error listing roles:", error);
    throw error; // Re-throw the error to be handled by the caller
  }
};

module.exports = {
  createResource,
  resourceList,
  createRole,
  roleList,
};
