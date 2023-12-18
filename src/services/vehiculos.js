import { dbConnection } from "../configs/dbConnection.js";
import { getTimestamp } from "../utils/time.js";

export const get = async ({ id }) => {
  try {
    let query = `
      SELECT 
        v.id,
        v.patente as vehiculo_patente,
        v.fecha_creacion as vehiculo_fecha_creacion,
        vt.id as vehiculo_tipo_id,
        vt.descripcion as vehiculo_tipo_descripcion,
        c.id as chofer_id,
        c.nombre as chofer_nombre,
        c.dni as chofer_dni,
        t.id as transporte_id,
        t.nombre as transporte_nombre,
        t.descripcion as transporte_descripcion,
        doc_vtv.url_archivo as vtv_url,
        doc_vtv.tipo_archivo as vtv_filetype
      FROM 
        vehiculo as v
        left join vehiculo_tipo as vt
          on v.id_vehiculo_tipo = vt.id
        left join chofer_vehiculo as cv
          on v.id=cv.id_vehiculo
        left join chofer as c
          on cv.id_chofer=c.id
        left join transporte_vehiculo as tv
          on tv.id_vehiculo=v.id
        left join transporte as t
          on t.id=tv.id_transporte
        left join (select * from documentacion where tipo_documentacion='vtv') as doc_vtv
          on doc_vtv.id_poseedor=v.id and doc_vtv.tipo_poseedor='vehiculo'
      WHERE v.activo=true`;
    
    let result;

    if (Boolean(id)) {
      query += ' and v.id=$1';
      result = await dbConnection.query(query, [id]);
      result.rows = result.rows[0];
    } else {
      result = await dbConnection.query(query);
    }

    return result.rows;
  } catch (error) {
    throw error;
  }
}

export const create = async ({ 
  chofer, 
  patente, 
  transporte, 
  vehiculo_tipo,
  connection
}) => {
  try {
    const timestamp = getTimestamp();

    const queryInsertVehiculo = `INSERT INTO vehiculo (
        patente, 
        id_vehiculo_tipo,
        fecha_creacion,
        activo
      ) values (
        $1, $2, $3, true
      )
      RETURNING id`;

    const vehiculoResult = await connection.queryWithParameters(queryInsertVehiculo, [
      patente, 
      vehiculo_tipo, 
      timestamp
    ]);
    const vehiculoId = vehiculoResult.rows[0].id;

    const queryInsertChoferVehiculo = `INSERT INTO chofer_vehiculo (
      id_chofer,
      id_vehiculo,
      fecha_creacion,
      activo
    ) values (
      $1, $2, $3, true
    )`;
    await connection.queryWithParameters(queryInsertChoferVehiculo, [
      chofer, 
      vehiculoId, 
      timestamp
    ]);

    const queryInsertTransporteVehiculo = `INSERT INTO transporte_vehiculo(
      id_transporte,
      id_vehiculo,
      fecha_creacion,
      activo
    ) values (
      $1, $2, $3, true
    )`;
    await connection.query(queryInsertTransporteVehiculo, [
      transporte, 
      vehiculoId, 
      timestamp
    ]);
    
    return vehiculoId;
  } catch (error) {
    throw error;
  }
}

export const update = async ({ id, transporte, chofer, patente, vehiculo_tipo, userEmail, connection }) => {
  try {
    const timestamp = getTimestamp();

    if (Boolean(transporte)) {
      const query = `
        UPDATE 
          transporte_vehiculo 
        SET 
          id_transporte=$1,
          fecha_ultima_edicion=$2,
          correo_ultima_edicion=$3
        WHERE
          id_vehiculo=$4
      `;
      await connection.queryWithParameters(query, [transporte, timestamp, userEmail, id]);
    }
    if (Boolean(chofer)) {
      const query = `
        UPDATE 
          chofer_vehiculo 
        SET 
          id_chofer=$1,
          fecha_ultima_edicion=$2,
          correo_ultima_edicion=$3
        WHERE
          id_vehiculo=$4
      `;
      await connection.queryWithParameters(query, [chofer, timestamp, userEmail, id]);
    }
    if (Boolean(patente)) {
      const query = `
        UPDATE 
          vehiculo 
        SET 
          patente=$1,
          fecha_ultima_edicion=$2,
          correo_ultima_edicion=$3
        WHERE
          id=$4
      `;
      await connection.queryWithParameters(query, [patente, timestamp, userEmail, id]);
    }
    if (Boolean(vehiculo_tipo)) {
      const query = `
        UPDATE 
          vehiculo 
        SET 
          id_vehiculo_tipo=$1,
          fecha_ultima_edicion=$2,
          correo_ultima_edicion=$3
        WHERE
          id=$4
      `;
      await connection.queryWithParameters(query, [vehiculo_tipo, timestamp, userEmail, id]);
    }

    return true;
  } catch (error) {
    throw error;
  }
}

export const softDelete = async ({ id, userEmail, connection }) => {
  try {
    const timestamp = getTimestamp();
    const query = `
      UPDATE 
        vehiculo 
      SET 
        fecha_ultima_edicion=$1,
        correo_ultima_edicion=$2,
        activo=false 
      WHERE 
        id=$3
    `;
    connection.queryWithParameters(query, [timestamp, userEmail, id]);

    return true;
  } catch (error) {
    throw error;
  }
}

export const getTipos = async () => {
  try {
    const query = 'SELECT * FROM vehiculo_tipo';
  
    const result = await dbConnection.query(query);
  
    return result.rows;
  } catch (error) {
    throw error;
  }
}