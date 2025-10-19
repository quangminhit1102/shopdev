"use strict";

/**
 * AWS S3 client configuration
 *
 * Exports a configured S3 client (`s3`) and commonly-used command constructors
 * from the AWS SDK v3 so other modules can import and use them directly.
 *
 * Environment variables used:
 * - AWS_BUCKET_ACCESS_KEY: AWS Access Key ID with S3 permissions
 * - AWS_BUCKET_SECRET_KEY: AWS Secret Access Key
 *
 * Notes and recommendations:
 * - Do NOT commit AWS credentials to source control — always load via environment
 *   variables or an IAM role when running on AWS infrastructure.
 * - Consider using IAM roles (EC2/ECS/Lambda) or AWS SDK default provider chain
 *   for production deployments instead of hard env credentials.
 * - The region is currently hard-coded to "ap-southeast-2". You may want to make
 *   this configurable via an environment variable (e.g. process.env.AWS_REGION).
 * - This file intentionally re-exports the Command constructors so callers can
 *   build and send commands like:
 *     const { s3, PutObjectCommand } = require('../configs/s3.config');
 *     await s3.send(new PutObjectCommand({ Bucket, Key, Body, ContentType }));
 */

const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} = require("@aws-sdk/client-s3");

// S3 client configuration object
const s3Config = {
  // Consider switching to process.env.AWS_REGION for flexibility
  region: "ap-southeast-2",
  credentials: {
    accessKeyId: process.env.AWS_BUCKET_ACCESS_KEY,
    secretAccessKey: process.env.AWS_BUCKET_SECRET_KEY,
  },
};

// Create an S3 client instance using the configuration above
const s3 = new S3Client(s3Config);

module.exports = {
  // Export the client and command constructors for convenience
  s3,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
};
