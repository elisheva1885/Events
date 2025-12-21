import { AppError } from "../middlewares/error.middleware.js";
import * as authServ from "../services/auth.service.js";
import { SupplierRepository } from "../repositories/suppliers.repositry.js";
import models from "../models/index.model.js";
import * as categorySrv from "../services/categories.service.js";
import { israelRegions } from "../shared/regions.js";
export const SupplierService = {
  async listSuppliers(query) {
    const { items, total, page, limit } = await SupplierRepository.findMany(
      query
    );
    return {
      suppliers: items,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit || 1),
      },
    };
  },
  async getSupplier(id) {
    const supplier = await SupplierRepository.findById(id);
    if (!supplier) throw new AppError(404, "ספק לא קיים במערכת");
    return supplier;
  },

  async getSupplierByUserId(userId) {
    const supplier = await SupplierRepository.getSupplierByUserId(userId);
    if (!supplier) throw new AppError(404, "ספק לא קיים במערכת");
    return supplier;
  },
  async updateSupplierStatus(id, status) {
    const validStatuses = ["בהמתנה", "מאושר", "נפסל", "נחסם"];
    if (!validStatuses.includes(status)) {
      throw new AppError(400, "סטטוס לא תקין");
    }
    const supplier = await SupplierRepository.updateStatus(id, status);
    if (!supplier) throw new AppError(404, "ספק לא נמצא");
    return supplier;
  },

  async registerSupplier({ userData, supplierData }) {
    
    
    // 1. בדיקת אימייל קיים
    const existingUser = await models.User.findOne({ email: userData.email });
    if (existingUser) throw new AppError(409, 'משתמש כבר קיים');
    
    // 2. בדיקת קטגוריה
    const category = await categorySrv.getCategoryById(supplierData.category);
    if(!category) throw new AppError(404, "קטגוריה לא קיימת");
    
    // 3. בדיקת regions
    if (!supplierData.regions || !Array.isArray(supplierData.regions) || supplierData.regions.length === 0) {
      throw new AppError(400, "חובה לבחור לפחות אזור שירות אחד");
    }

    // Ensure regions are valid and exist in the predefined list (trim whitespace)
    const trimmedRegions = supplierData.regions.map(r => (typeof r === 'string' ? r.trim() : String(r).trim()));
    
    supplierData.regions = trimmedRegions.filter(region => {
      const isValid = israelRegions.includes(region);
      if (!isValid) {
        console.warn(`⚠️ אזור לא חוקי: "${region}"`);
      }
      return isValid;
    });

    if (supplierData.regions.length === 0) {
      throw new AppError(400, "חובה לבחור לפחות אזור שירות תקין אחד");
    }
    
    // ===== רק עכשיו יוצרים את המשתמש =====
    let user;
    try {
      const result = await authServ.register({ ...userData });
      user = result.user;
      const token = result.token;
      
      supplierData.category = category._id;
      const supplier = await SupplierRepository.createSupplier({
        user: user._id,
        ...supplierData,
      });
      
      return { user, supplier, token };
    } catch (error) {
      if (user && user._id) {
        await models.User.findByIdAndDelete(user._id);
      }
      throw error;
    }
  },
 
  async updateSupplierMedia(id, profileImage, media, baseBudget, priceFiles) {
    const supplierId = await SupplierRepository.getSupplierIdByUserId(id);
    if (!supplierId) throw new AppError(404, "ספק לא נמצא");
    const supplier = await SupplierRepository.updateSupplierMedia(
      supplierId,
      profileImage,
      media,
      baseBudget,
      priceFiles
    );
    return supplier;
  },
};

export default SupplierService;
