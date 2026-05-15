import { Router } from 'express';
import multer from 'multer';
import { requireAuth } from '../middlewares/auth.middleware';
import { uploadPetImageFromBuffer } from '../services/uploads.service';

export const uploadsRouter = Router();

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 60 * 1024 * 1024 } }); // 60MB per file

uploadsRouter.post('/uploads/pet-image', requireAuth, upload.single('file'), async (req, res, next) => {
  try {
    const file = (req as any).file as Express.Multer.File | undefined;
    if (!file) {
      res.status(400).json({ error: 'No file provided' });
      return;
    }

    const ownerId = req.user?.uid ?? 'anonymous';
    const url = await uploadPetImageFromBuffer(file.buffer, file.mimetype, ownerId);
    res.status(201).json({ data: { url } });
  } catch (err) {
    next(err);
  }
});

export default uploadsRouter;
