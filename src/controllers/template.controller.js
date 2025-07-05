"use strict";
const TemplateService = require("../services/template.service");

class TemplateController {
  static async create(req, res, next) {
    try {
      const template = await TemplateService.createTemplate(req.body);
      res.status(201).json({ message: "Template created", data: template });
    } catch (err) {
      next(err);
    }
  }

  static async list(req, res, next) {
    try {
      const templates = await TemplateService.getTemplates(req.query);
      res.json({ data: templates });
    } catch (err) {
      next(err);
    }
  }

  static async get(req, res, next) {
    try {
      const template = await TemplateService.getTemplateById(req.params.id);
      res.json({ data: template });
    } catch (err) {
      next(err);
    }
  }

  static async update(req, res, next) {
    try {
      const template = await TemplateService.updateTemplate(
        req.params.id,
        req.body
      );
      res.json({ message: "Template updated", data: template });
    } catch (err) {
      next(err);
    }
  }

  static async delete(req, res, next) {
    try {
      await TemplateService.deleteTemplate(req.params.id);
      res.json({ message: "Template deleted" });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = TemplateController;
