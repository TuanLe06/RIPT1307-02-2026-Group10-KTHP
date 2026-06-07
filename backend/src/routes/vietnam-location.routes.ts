import { Router, type Router as ExpressRouter } from 'express';
import {
  listVietnamProvinces,
  listVietnamWardsByProvince,
} from '../controllers/vietnam-location.controller';

const router: ExpressRouter = Router();

router.get('/provinces', listVietnamProvinces);
router.get('/cities', listVietnamProvinces);
router.get('/provinces/:provinceCode/wards', listVietnamWardsByProvince);
router.get('/wards', listVietnamWardsByProvince);

export default router;
