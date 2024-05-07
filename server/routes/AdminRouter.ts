import platFormController from '@/controllers/PlatFormController/platFormController';
import express from 'express';

const AdminRouter = express.Router();

// platforms routes
AdminRouter.post('/addPlatForm', platFormController.AddPlatFormController);
AdminRouter.post('/editPlatForm', platFormController.EditPlatFormController);
AdminRouter.post(
    '/deletePlatForm',
    platFormController.DeletePlatFormController,
);

export default AdminRouter;
