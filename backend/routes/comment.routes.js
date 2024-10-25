import express from 'express';
import { getAllComments, createComment, deleteComment,} from '../controllers/comment.controller.js';

const router = express.Router();


router.get('/:productId/comments', getAllComments);
router.post('/:productId/comments', createComment);
router.delete('/comments/:id', deleteComment);

export default router;
