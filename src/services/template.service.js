"use strict";
const Template = require("../models/template.model");
const { BadRequestError, NotFoundError } = require("../core/error.response");

class TemplateService {
  // Create a new template
  static async createTemplate(data) {
    try {
      return await Template.create(data);
    } catch (err) {
      throw err;
    }
  }

  // Get all templates (with optional filters)
  static async getTemplates(filter = {}) {
    return await Template.find(filter).lean();
  }

  // Get a single template by ID
  static async getTemplateById(template_id) {
    const template = await Template.findOne({ template_id }).lean();
    if (!template) throw new NotFoundError("Template not found");
    return template;
  }

  // Update a template by ID
  static async updateTemplate(template_id, update) {
    const template = await Template.findOneAndUpdate({ template_id }, update, {
      new: true,
    });
    if (!template) throw new NotFoundError("Template not found");
    return template;
  }

  // Delete a template by ID
  static async deleteTemplate(template_id) {
    const template = await Template.findOneAndDelete({ template_id });
    if (!template) throw new NotFoundError("Template not found");
    return template;
  }
}

module.exports = TemplateService;
