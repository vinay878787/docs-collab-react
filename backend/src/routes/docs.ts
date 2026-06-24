import { Router } from 'express';
import {
  createDocumentSchema,
  patchDocTitleSchema,
  setPublicAccessSchema,
  shareDocumentSchema,
} from '@docs-collab/shared';
import {
  createDoc,
  deleteDoc,
  getDoc,
  listDocs,
  patchDocTitle,
  removeCollaborator,
  setPublicAccess,
  shareDoc,
} from '../controllers/docs';
import { validate } from '../middlewares/validate';
import { verifyToken } from '../middlewares/verify-token';

const docsRouter = Router();

docsRouter.post('/', verifyToken, validate(createDocumentSchema), createDoc);
docsRouter.get('/', verifyToken, listDocs);
docsRouter.get('/:id', verifyToken, getDoc);
docsRouter.delete('/:id', verifyToken, deleteDoc);
docsRouter.patch(
  '/:id/title',
  verifyToken,
  validate(patchDocTitleSchema),
  patchDocTitle,
);
docsRouter.post(
  '/:id/share',
  verifyToken,
  validate(shareDocumentSchema),
  shareDoc,
);
docsRouter.delete('/:id/share/:userId', verifyToken, removeCollaborator);
docsRouter.patch(
  '/:id/public-access',
  verifyToken,
  validate(setPublicAccessSchema),
  setPublicAccess,
);

export default docsRouter;
