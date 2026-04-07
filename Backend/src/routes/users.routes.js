import { Router } from 'express';
import { 
  login, 
  register, 
  addToHistory,        // ✅ FIXED NAME
  getUserHistory       // ✅ FIXED NAME
} from '../controllers/user.controller.js';

const router = Router();

// ================= AUTH =================
router.route("/login").post(login);
router.route("/register").post(register);

// ================= HISTORY =================
router.route("/add_to_activity").post(addToHistory);     // ✅ FIXED
router.route("/get_all_activity").get(getUserHistory);   // ✅ FIXED

export default router;