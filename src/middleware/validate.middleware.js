import Joi from 'joi';
import { sendError } from '../utils/response.js';


export const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errorMessages = error.details.map((detail) => detail.message);
      return sendError(res, "Validation failed.", errorMessages, 400);
    }

    req.body = value;
    next();
  };
};

export const userLoginSchema = Joi.object({
  userName: Joi.string().required(),
  password: Joi.string().required(),
});

export const userCreateSchema = Joi.object({
  name: Joi.string().min(3).max(100).required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('ADMIN', 'STOCK_MANAGER', 'STAFF').optional(),
  roleName: Joi.string().valid('ADMIN', 'STOCK MANAGER', 'STAFF', 'Admin').optional(),
  roleId: Joi.number().integer().optional(),
  phone: Joi.string().optional().allow('', null),
  status: Joi.string().valid('Active', 'Inactive').default('Active'),
}).or('role', 'roleName', 'roleId');

export const userChangePasswordSchema = Joi.object({
  userName: Joi.string().required(),
  newPassword: Joi.string().min(6).required(),
});

export const categorySchema = Joi.object({
  categoryName: Joi.string().min(2).max(100).required(),
});

export const roleSchema = Joi.object({
  roleName: Joi.string().min(2).max(50).required(),
});

export const brandSchema = Joi.object({
  brandName: Joi.string().min(2).max(100).required(),
});

export const productSchema = Joi.object({
  barcode: Joi.string().optional().allow('', null),
  productName: Joi.string().min(3).max(150).required(),
  category: Joi.string().min(2).max(100).required(),
  brand: Joi.string().min(2).max(100).required(),
  size: Joi.string().valid("XS", "S", "M", "L", "XL", "XXL", "3XL", "4XL", "5XL").required(),
  color: Joi.string().required(),
  mrp: Joi.number().greater(0).required(),
  gst: Joi.number().valid(0, 5, 12, 18, 28).required(),
  discount: Joi.number().min(0).max(100).default(0),
  image: Joi.string().optional().allow(null, ''),
  status: Joi.string().valid('Active', 'Inactive').default('Active'),
});

export const customerSchema = Joi.object({
  customerName: Joi.string().min(2).max(100).required(),
  mobile: Joi.string().pattern(/^[0-9]{10}$/).required().messages({
    "string.pattern.base": "Mobile number must be a valid 10-digit number.",
  }),
  email: Joi.string().email().optional().allow('', null),
  address: Joi.string().optional().allow('', null),
  gstNumber: Joi.string().optional().allow('', null),
});

export const billingSchema = Joi.object({
  customerId: Joi.number().integer().optional().allow(null),
  items: Joi.array().items(
    Joi.object({
      productId: Joi.number().integer().required(),
      barcode: Joi.string().required(),
      quantity: Joi.number().integer().greater(0).required(),
      price: Joi.number().greater(0).required(),
      gst: Joi.number().min(0).required(),
      discount: Joi.number().min(0).default(0)
    })
  ).min(1).required(),
  paymentMethod: Joi.string().valid("Cash", "Card", "UPI", "NetBanking").required(),
});

export const transferSchema = Joi.object({
  productId: Joi.number().integer().required(),
  fromLocation: Joi.string().required(),
  toLocation: Joi.string().required(),
  quantity: Joi.number().integer().greater(0).required(),
});

export const returnSchema = Joi.object({
  invoiceId: Joi.number().integer().required(),
  productId: Joi.number().integer().required(),
  quantity: Joi.number().integer().greater(0).required(),
  refundAmount: Joi.number().min(0).required(),
  returnReason: Joi.string().required(),
});

export const settingSchema = Joi.object({
  gst: Joi.number().min(0).max(100).required(),
  invoicePrefix: Joi.string().max(20).required(),
  defaultDiscount: Joi.number().min(0).max(100).required(),
  shopName: Joi.string().required(),
  shopAddress: Joi.string().required(),
  shopGST: Joi.string().required(),
});
