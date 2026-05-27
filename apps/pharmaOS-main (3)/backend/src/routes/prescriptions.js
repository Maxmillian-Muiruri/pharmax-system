import { Router } from "express";
import {
  uploadPrescription,
  getUserPrescriptions,
  getPrescription,
  updatePrescriptionStatus,
} from "../controllers/prescriptionController.js";
import { roleGuard } from "../middleware/roleGuard.js";
import { validate } from "../middleware/validate.js";
import { prescriptionSchema } from "../middleware/schemas.js";7
import { authenticate } from "../middleware/auth.js";

const router = Router();

// Customer can upload and view their prescriptions
router.use(authenticate);
router.use(
  roleGuard(["CUSTOMER", "ADMIN", "SUPER_ADMIN", "PHARMACIST", "MANAGER"]),
);

router.post("/", validate(prescriptionSchema), uploadPrescription);
router.get("/", getUserPrescriptions);
router.get("/:id", getPrescription);

// Pharmacy staff can update prescription status
router.put(
  "/:id/status",
  roleGuard(["ADMIN", "SUPER_ADMIN", "PHARMACIST", "MANAGER"]),
  updatePrescriptionStatus,
);

export default router;
