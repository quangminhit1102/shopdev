const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'ShopDev API Documentation',
      version: '1.0.0',
      description: 'API documentation for ShopDev e-commerce platform',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
        ApiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'x-api-key',
        },
      },
      schemas: {
        Shop: {
          type: 'object',
          required: ['name', 'email', 'password'],
          properties: {
            name: {
              type: 'string',
              description: 'Name of the shop'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email address of the shop'
            },
            password: {
              type: 'string',
              format: 'password',
              description: 'Shop password'
            },
            status: {
              type: 'string',
              enum: ['active', 'inactive'],
              description: 'Shop status'
            },
            roles: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Shop roles'
            }
          }
        },
        Cart: {
          type: 'object',
          properties: {
            userId: {
              type: 'string',
              description: 'ID of the user who owns the cart'
            },
            status: {
              type: 'string',
              enum: ['active', 'completed', 'failed', 'pending'],
              description: 'Cart status'
            },
            products: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  productId: {
                    type: 'string',
                    description: 'ID of the product'
                  },
                  quantity: {
                    type: 'number',
                    description: 'Quantity of the product'
                  }
                }
              }
            }
          }
        },
        Order: {
          type: 'object',
          required: ['userId', 'shipping', 'payment', 'products'],
          properties: {
            userId: {
              type: 'string',
              description: 'ID of the user placing the order'
            },
            shipping: {
              type: 'object',
              properties: {
                address: { type: 'string' },
                city: { type: 'string' },
                state: { type: 'string' },
                country: { type: 'string' },
                zipCode: { type: 'string' }
              }
            },
            payment: {
              type: 'object',
              properties: {
                method: { type: 'string' },
                status: { type: 'string' }
              }
            },
            products: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  productId: { type: 'string' },
                  quantity: { type: 'number' }
                }
              }
            },
            status: {
              type: 'string',
              enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
              description: 'Order status'
            }
          }
        },
        Inventory: {
          type: 'object',
          required: ['productId', 'stock', 'location'],
          properties: {
            productId: {
              type: 'string',
              description: 'ID of the product'
            },
            stock: {
              type: 'number',
              description: 'Available quantity'
            },
            location: {
              type: 'string',
              description: 'Storage location'
            },
            reservations: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  orderId: { type: 'string' },
                  quantity: { type: 'number' }
                }
              }
            }
          }
        },
        Discount: {
          type: 'object',
          required: ['code', 'type', 'value'],
          properties: {
            code: {
              type: 'string',
              description: 'Discount code'
            },
            type: {
              type: 'string',
              enum: ['percentage', 'fixed_amount'],
              description: 'Type of discount'
            },
            value: {
              type: 'number',
              description: 'Discount value'
            },
            startDate: {
              type: 'string',
              format: 'date-time',
              description: 'Start date of the discount'
            },
            endDate: {
              type: 'string',
              format: 'date-time',
              description: 'End date of the discount'
            },
            maxUses: {
              type: 'number',
              description: 'Maximum number of uses'
            },
            usageCount: {
              type: 'number',
              description: 'Current usage count'
            },
            minOrderValue: {
              type: 'number',
              description: 'Minimum order value required'
            }
          }
        }
      }
    }
  },
  apis: ['./src/controllers/*.js'], // Path to the API docs
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
