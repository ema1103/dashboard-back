import { Router } from "express";
import * as authMiddleware from '../middlewares/auth.js';
import * as multerMiddleware from '../middlewares/multer.js';
import * as tarifarioMiddleware from '../middlewares/tarifarios.js';
import * as tarifarioTransportesController from '../controllers/tarifarioTransportes.js';
import * as vehiculosMiddleware from '../middlewares/vehiculos.js';
import * as zonasMiddleware from '../middlewares/zonas.js';
import * as permisosMiddleware from '../middlewares/permisos.js';

const api = Router();

api.get('/tarifario-transportes',
  authMiddleware.isAuthenticated,
  permisosMiddleware.validar('VER_TARIFARIOS'),
  tarifarioTransportesController.get
);

api.get('/tarifario-transportes/:id',
  authMiddleware.isAuthenticated,
  permisosMiddleware.validar('VER_TARIFARIOS'),
  tarifarioTransportesController.get
);

api.post('/tarifario-transportes',
  authMiddleware.isAuthenticated,
  permisosMiddleware.validar('CREAR_TARIFARIO_PROVEEDOR'),
  multerMiddleware.upload.none(),
  zonasMiddleware.upsertZona,
  vehiculosMiddleware.upsertVehiculoTipo,
  tarifarioMiddleware.validateNewTarifarioTransporte,
  tarifarioTransportesController.create
);

api.patch('/tarifario-transportes/:id',
  authMiddleware.isAuthenticated,
  permisosMiddleware.validar('EDITAR_TARIFARIO_PROVEEDOR'),
  multerMiddleware.upload.none(),
  tarifarioTransportesController.update
);

api.delete('/tarifario-transportes/:id',
  authMiddleware.isAuthenticated,
  permisosMiddleware.validar('ELIMINAR_TARIFARIO_PROVEEDOR'),
  tarifarioTransportesController.softDelete
);

export default api;