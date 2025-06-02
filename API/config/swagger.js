const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Ticket Management System API',
      version: '1.0.0',
      description: 'API documentation for the ticket management system with customer support, agent workflows, and admin controls',
      contact: {
        name: 'API Support',
        email: 'support@ticketsystem.com'
      }
    },    servers: [
      {
        url: 'http://localhost:3000/api',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT token'
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'User ID'
            },
            firstName: {
              type: 'string',
              description: 'User first name'
            },
            lastName: {
              type: 'string',
              description: 'User last name'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address'
            },
            role: {
              type: 'string',
              enum: ['customer', 'service_agent', 'admin'],
              description: 'User role'
            },
            isVerified: {
              type: 'boolean',
              description: 'Email verification status'
            },
            profilePicture: {
              type: 'string',
              description: 'Profile picture URL'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Ticket: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'Ticket ID'
            },
            title: {
              type: 'string',
              description: 'Ticket title'
            },
            description: {
              type: 'string',
              description: 'Ticket description'
            },
            category: {
              type: 'string',
              enum: ['technical', 'billing', 'general', 'feature_request'],
              description: 'Ticket category'
            },
            priority: {
              type: 'string',
              enum: ['low', 'medium', 'high', 'urgent'],
              description: 'Ticket priority'
            },
            status: {
              type: 'string',
              enum: ['open', 'in_progress', 'resolved', 'closed'],
              description: 'Ticket status'
            },
            userId: {
              type: 'string',
              description: 'ID of user who created the ticket'
            },
            assignedTo: {
              type: 'string',
              description: 'ID of assigned agent'
            },
            attachments: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  filename: { type: 'string' },
                  url: { type: 'string' },
                  size: { type: 'number' }
                }
              }
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Chat: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'Chat message ID'
            },
            ticketId: {
              type: 'string',
              description: 'Associated ticket ID'
            },
            userId: {
              type: 'string',
              description: 'ID of user who sent the message'
            },
            message: {
              type: 'string',
              description: 'Chat message content'
            },
            timestamp: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        CreateTicket: {
          type: 'object',
          required: ['title', 'description', 'category', 'priority'],
          properties: {
            title: {
              type: 'string',
              description: 'Ticket title'
            },
            description: {
              type: 'string',
              description: 'Ticket description'
            },
            category: {
              type: 'string',
              enum: ['technical', 'billing', 'general', 'feature_request'],
              description: 'Ticket category'
            },
            priority: {
              type: 'string',
              enum: ['low', 'medium', 'high', 'urgent'],
              description: 'Ticket priority'
            }
          }
        },
        UpdateTicket: {
          type: 'object',
          properties: {
            title: {
              type: 'string',
              description: 'Ticket title'
            },
            description: {
              type: 'string',
              description: 'Ticket description'
            },
            status: {
              type: 'string',
              enum: ['open', 'in_progress', 'resolved', 'closed'],
              description: 'Ticket status'
            },
            priority: {
              type: 'string',
              enum: ['low', 'medium', 'high', 'urgent'],
              description: 'Ticket priority'
            },
            assignedTo: {
              type: 'string',
              description: 'ID of assigned agent'
            }
          }
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              description: 'User email'
            },
            password: {
              type: 'string',
              format: 'password',
              description: 'User password'
            }
          }
        },
        SignupRequest: {
          type: 'object',
          required: ['firstName', 'lastName', 'email', 'password'],
          properties: {
            firstName: {
              type: 'string',
              description: 'User first name'
            },
            lastName: {
              type: 'string',
              description: 'User last name'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email'
            },
            password: {
              type: 'string',
              format: 'password',
              description: 'User password'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Error message'
            },
            error: {
              type: 'string',
              description: 'Error details'
            }
          }
        },
        Success: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Success message'
            },
            data: {
              type: 'object',
              description: 'Response data'
            }
          }
        }
      }
    },
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication and authorization'
      },
      {
        name: 'Users',
        description: 'User management operations'
      },
      {
        name: 'Tickets',
        description: 'Ticket management operations'
      },
      {
        name: 'Chat',
        description: 'Chat and messaging operations'
      },
      {
        name: 'Analytics',
        description: 'Analytics and reporting'
      },
      {
        name: 'OAuth',
        description: 'OAuth authentication'
      }
    ]
  },  apis: [
    './routes/*.js',
    './controllers/*.js',
    './models/*.js',
    './middleware/*.js'
  ], // Path to the API routes, controllers, models, and middleware
};

const specs = swaggerJsdoc(options);

module.exports = { specs, swaggerUi };
