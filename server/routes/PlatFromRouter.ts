import platFormController from '@/controllers/PlatFormController/platFormController';
import express from 'express';

const PlatFromRouter = express.Router();

PlatFromRouter.get(
    '/getAllPlatForms',
    platFormController.getAllPlatFormController,
);

export default PlatFromRouter;
