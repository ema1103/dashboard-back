import * as tarifarioViajesEspecialesService from "../services/tarifarioViajesEspeciales.js";
import { createTransaction } from "../configs/dbConnection.js";

export const get = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await tarifarioViajesEspecialesService.get({ id });

    res.json({ data: result });
  } catch (error) {
    res.status(error?.statusCode || 500).json({ message: 'Error al obtener tarifarios', error });
  }
}

export const create = async (req, res) => {
  let connection;

  try {
    connection = await createTransaction();

    const idTarifario = await tarifarioViajesEspecialesService.createTarifarioCliente({ ...req.body, connection });

    await connection.commit();
    res.status(201).json({ message: 'Tarifario de cliente creado exitosamente', idTarifario });
  } catch (error) {
    await connection?.rollback();
    res.status(error?.statusCode || 500).json({ message: 'Error al crear tarifario de cliente', error: error.message });
  }
}

export const update = async (req, res) => {
  let connection;
  
  try {
    const { id } = req.params;
    const { mail: userEmail } = req.user.profile;
    connection = await createTransaction();

    await tarifarioViajesEspecialesService.update({ ...req.body, userEmail, connection, id });

    await connection.commit();
    res.status(200).json({ message: 'Tarifario actualizado correctamente' });
  } catch (error) {
    await connection?.rollback();
    res.status(error?.statusCode || 500).json({ message: 'Error al actualizar Tarifario', error: error.message });
  }
}

export const softDelete = async (req, res) => {
  const { mail: userEmail } = req.user.profile;
  let connection;

  try {
    connection = await createTransaction();
    const { id } = req.params;

    await tarifarioViajesEspecialesService.softDelete({ id, userEmail, connection });

    connection.commit();
    res.status(200).json({ message: 'Tarifario borrado' });
  } catch (error) {
    await connection?.rollback();
    res.status(error?.statusCode || 500).json({ message: 'Error al borrar tarifario', error: error.message });
  }
}