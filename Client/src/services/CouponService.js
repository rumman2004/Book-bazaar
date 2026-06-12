import api from './Api';

const CouponService = {
  // Admin Methods
  getAllCoupons: async () => {
    return api.get('/admin/coupons');
  },
  
  createCoupon: async (couponData) => {
    return api.post('/admin/coupons', couponData);
  },
  
  toggleCouponStatus: async (id) => {
    return api.put(`/admin/coupons/${id}/toggle`);
  },

  // Buyer Methods
  validateCoupon: async (code) => {
    return api.post('/buyer/coupons/validate', { code });
  }
};

export default CouponService;
