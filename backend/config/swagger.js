const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Enterprise ERP Management System API',
      version: '1.0.0',
      description: 'Comprehensive REST API documentation for the modular Enterprise ERP Management System, developed with Node.js, Express, and MongoDB.',
      contact: {
        name: 'ERP Technical Support',
        email: 'support@enterprise-erp.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Local Development Server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Authenticate protected endpoints using Bearer tokens: "Bearer <token>"',
        },
      },
      schemas: {
        User: {
          type: 'object',
          required: ['name', 'email', 'password', 'role'],
          properties: {
            name: { type: 'string', example: 'John Smith' },
            email: { type: 'string', format: 'email', example: 'john@erp.com' },
            password: { type: 'string', format: 'password', example: 'securepass123' },
            role: { type: 'string', enum: ['Admin', 'Manager', 'Employee'], example: 'Employee' },
          },
        },
        Employee: {
          type: 'object',
          required: ['employee_code', 'designation', 'salary', 'joining_date'],
          properties: {
            employee_code: { type: 'string', example: 'EMP-1024' },
            designation: { type: 'string', example: 'Software Engineer' },
            salary: { type: 'number', example: 6000 },
            joining_date: { type: 'string', format: 'date', example: '2026-05-01' },
            phone: { type: 'string', example: '+19876543210' },
            address: { type: 'string', example: '456 Innovation Blvd, Tech Park' },
            profile_image: { type: 'string', example: 'uploads/emp-profile.jpg' },
            status: { type: 'string', enum: ['Active', 'Inactive', 'Suspended'], example: 'Active' },
          },
        },
        Department: {
          type: 'object',
          required: ['department_name'],
          properties: {
            department_name: { type: 'string', example: 'Research & Development' },
            manager_id: { type: 'string', example: '60d0fe4f5311236168a109ca' },
          },
        },
        Attendance: {
          type: 'object',
          properties: {
            date: { type: 'string', example: '2026-07-04' },
            clocked_in: { type: 'string', format: 'date-time', example: '2026-07-04T09:12:00.000Z' },
            clocked_out: { type: 'string', format: 'date-time', example: '2026-07-04T17:30:00.000Z' },
            status: { type: 'string', enum: ['Present', 'Late', 'Absent', 'Half Day'], example: 'Late' },
          },
        },
        LeaveRequest: {
          type: 'object',
          required: ['type', 'start_date', 'end_date', 'reason'],
          properties: {
            type: { type: 'string', enum: ['Casual', 'Sick', 'Maternity', 'Paternity'], example: 'Sick' },
            start_date: { type: 'string', format: 'date', example: '2026-08-12' },
            end_date: { type: 'string', format: 'date', example: '2026-08-14' },
            reason: { type: 'string', example: 'Medical procedure' },
          },
        },
        Payroll: {
          type: 'object',
          required: ['month', 'year'],
          properties: {
            month: { type: 'integer', example: 7 },
            year: { type: 'integer', example: 2026 },
            basic_salary: { type: 'number', example: 6000 },
            bonus: { type: 'number', example: 200 },
            deduction: { type: 'number', example: 0 },
            tax: { type: 'number', example: 600 },
            pf: { type: 'number', example: 300 },
            net_salary: { type: 'number', example: 5300 },
          },
        },
      },
    },
  },
  // Parse routes documentation annotations
  apis: ['./routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

const setupSwagger = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};

module.exports = setupSwagger;
