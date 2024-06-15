import { Router } from 'express';
import { registerPublisher, getAllPublishers } from '../controllers/authController';
import { getPublishers } from '../controllers/publisherController';
import { createNewSheet, getSheets, deleteSheet } from '../controllers/sheetController';
import { getUpdatesForSubscription, getUpdatesForPublished, updatePublished, updateSubscription } from '../controllers/updateController';
import auth from '../middleware/auth';

const router = Router();

/**
 * Authentication routes.
 *
 * @route GET /register - Register a new publisher.
 * @route GET /getPublishers - Get all registered publishers.
 * 
 * @author syadav7173
 */
router.get('/register', auth, registerPublisher);
router.get('/getPublishers', auth, getAllPublishers);

/**
 * Publisher route.
 *
 * @route GET /publishers - Get publisher details.
 * 
 * @author syadav7173
 */
router.get('/publishers', auth, getPublishers);

/**
 * Sheet routes.
 *
 * @route POST /createSheet - Create a new sheet.
 * @route POST /getSheets - Get sheets for a publisher.
 * @route POST /deleteSheet - Delete a sheet.
 * 
 * @author syadav7173
 */
router.post('/createSheet', auth, createNewSheet);
router.post('/getSheets', auth, getSheets);
router.post('/deleteSheet', auth, deleteSheet);

/**
 * Update routes.
 *
 * @route POST /getUpdatesForSubscription - Get updates for a subscription.
 * @route POST /getUpdatesForPublished - Get updates for published content.
 * @route POST /updatePublished - Update published content.
 * @route POST /updateSubscription - Update a subscription.
 * 
 * @file router.ts
 * 
 * @author syadav7173
 */
router.post('/getUpdatesForSubscription', auth, getUpdatesForSubscription);
router.post('/getUpdatesForPublished', auth, getUpdatesForPublished);
router.post('/updatePublished', auth, updatePublished);
router.post('/updateSubscription', auth, updateSubscription);

export default router;
