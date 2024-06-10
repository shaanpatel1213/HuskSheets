import { Router } from 'express';
import { registerPublisher, getAllPublishers } from '../controllers/authController';
import { getPublishers } from '../controllers/publisherController';
import { createNewSheet, getSheets, deleteSheet } from '../controllers/sheetController';
import { getUpdatesForSubscription, getUpdatesForPublished, updatePublished, updateSubscription } from '../controllers/updateController';
import auth from '../middleware/auth';

const router = Router();

//auth routes
router.get('/register', auth, registerPublisher);
router.get('/getPublishers', auth, getAllPublishers);

//publisher routes
router.get('/publishers', auth, getPublishers);

//sheet routes
router.post('/createSheet', auth, createNewSheet);
router.post('/getSheets', auth, getSheets);
router.post('/deleteSheet', auth, deleteSheet);

//update routes
router.post('/getUpdatesForSubscription', auth, getUpdatesForSubscription);
router.post('/getUpdatesForPublished', auth, getUpdatesForPublished);
router.post('/updatePublished', auth, updatePublished);
router.post('/updateSubscription', auth, updateSubscription);

export default router;
