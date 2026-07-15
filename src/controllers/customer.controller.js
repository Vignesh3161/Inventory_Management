import CustomerModel from '../models/customer.model.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const addCustomer = async (req, res, next) => {
  try {
    const customerName = req.body.name || req.body.customerName || null;
    const { mobile } = req.body;

    if (!mobile) {
      return sendError(res, 'Mobile number is required.', null, 400);
    }

    const existing = await CustomerModel.findByMobile(mobile);
    if (existing) {
      return sendError(res, 'Customer with this mobile number already exists.', null, 400);
    }

    const created = await CustomerModel.create({
      customerName,
      mobile,
      status: 'Active'
    });

    return sendSuccess(res, 'Customer created successfully.', created, 201);
  } catch (error) {
    next(error);
  }
};

export const getCustomerById = async (req, res, next) => {
  try {
    const customer = await CustomerModel.findById(req.params.id);
    if (!customer) {
      return sendError(res, 'Customer not found.', null, 404);
    }
    return sendSuccess(res, 'Customer retrieved successfully.', customer);
  } catch (error) {
    next(error);
  }
};

export const getCustomerByMobile = async (req, res, next) => {
  try {
    const customer = await CustomerModel.findByMobile(req.params.mobile);
    if (!customer) {
      return sendError(res, 'Customer not found.', null, 404);
    }
    return sendSuccess(res, 'Customer found.', customer);
  } catch (error) {
    next(error);
  }
};

export const getAllCustomers = async (req, res, next) => {
  try {
    const customers = await CustomerModel.findAll();
    return sendSuccess(res, 'Customers retrieved successfully.', customers);
  } catch (error) {
    next(error);
  }
};

export const updateCustomer = async (req, res, next) => {
  try {
    const customerId = req.params.id;
    const customer = await CustomerModel.findById(customerId);
    if (!customer) {
      return sendError(res, 'Customer not found.', null, 404);
    }

    const customerName = req.body.name || req.body.customerName || customer.customerName;
    const { mobile, status } = req.body;

    if (mobile && mobile !== customer.mobile) {
      const existing = await CustomerModel.findByMobile(mobile);
      if (existing) {
        return sendError(res, 'Customer with this mobile number already exists.', null, 400);
      }
    }

    const updated = await CustomerModel.update(customerId, {
      customerName,
      mobile: mobile || customer.mobile,
      status: status || customer.status
    });

    return sendSuccess(res, 'Customer updated successfully.', updated);
  } catch (error) {
    next(error);
  }
};

export const deleteCustomer = async (req, res, next) => {
  try {
    const customerId = req.params.id;
    const customer = await CustomerModel.findById(customerId);
    if (!customer) {
      return sendError(res, 'Customer not found.', null, 404);
    }

    const hasHistory = await CustomerModel.hasPurchaseHistory(customerId);
    if (hasHistory) {
      await CustomerModel.update(customerId, { status: 'Inactive' });
      return sendSuccess(res, 'Customer marked as inactive to preserve purchase history.');
    } else {
      await CustomerModel.delete(customerId);
      return sendSuccess(res, 'Customer deleted successfully.');
    }
  } catch (error) {
    next(error);
  }
};

export const getCustomerPurchases = async (req, res, next) => {
  try {
    const customerId = req.params.id;
    const customer = await CustomerModel.findById(customerId);
    if (!customer) {
      return sendError(res, 'Customer not found.', null, 404);
    }
    const history = await CustomerModel.getPurchaseHistory(customerId);
    return sendSuccess(res, 'Customer purchase history retrieved successfully.', history);
  } catch (error) {
    next(error);
  }
};
