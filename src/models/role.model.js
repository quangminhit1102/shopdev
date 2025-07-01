"use strict";
const { model, Schema } = require("mongoose");
const DOCUMENT_NAME = "Role";
const COLLECTION_NAME = "Roles";

// Sample grants for roles
// These grants define what actions each role can perform on different resources
// In a real application, these would be defined based on your application's requirements
// and stored in the database or a configuration file.
// const grantList = [
//     {role : 'admin', resource: 'profile', actions: ['read:any', 'update:any'], attributes: ['*']},
//     {role : 'admin', resource: 'balance', actions: ['read:any', 'update:any'], attributes: ['*', '!mount']},

//     {role : 'shop', resource: 'profile', actions: ['update:own'], attributes: ['*']},
//     {role : 'shop', resource: 'balance', actions: ['update:own'], attributes: ['*', '!mount']},

//     {role : 'user', resource: 'category', actions: ['update:own'], attributes: ['*']},
//     {role : 'user', resource: 'discount', actions: ['read:own'], attributes: ['*']},
// ];

const userSchema = new Schema(
  {
    rol_name: { type: String, required: true }, // Role name
    rol_slug: { type: String, required: true }, // Role slug
    rol_status: {
      type: String,
      default: "active",
      enum: ["active", "block", "pending"],
    },
    rol_description: { type: String, default: "" }, // Role description
    rol_grants: [
      {
        resource: {
          type: Schema.Types.ObjectId,
          ref: "Resource",
          required: true,
        }, // Reference to Resource model
        actions: [
          {
            type: String,
            required: true,
          }, // Actions allowed on the resource
        ],
        attributes: { type: String, default: "*" }, // Attributes that can be accessed or modified
      },
    ], // Array of resources granted to the role
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);
module.exports = model(DOCUMENT_NAME, userSchema);
