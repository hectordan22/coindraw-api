// libreria o modulo que nos ayuda con la conexion a la Base de Datos
import { pool } from "../db.js";
import moment from "moment-timezone";

// Modulo que nos ayuda a generar un id unico en automatico
import { v4 as uuidv4 } from "uuid";

// Modulo que me trae el precio del Dolar Paralelo Venezuela
import { getMonitor } from "consulta-dolar-venezuela";

/* Para websockets import { broadcastRifaUpdate } from '../websocket/index.js' */

// Almacén de clientes conectados para las rifas SSE (en memoria, para simplificar)
const clients = new Set();

import fs from "fs";

const saveImage = (file) => {
  let cleanName = file.originalname.replace(" ", "-");
  const newPath = `./public/premios/${cleanName}`;
  fs.renameSync(file.path, newPath);
  return {
    nameImage: cleanName,
  };
};

/**
 * Muestra todos los compradores de las Rifas
 */
export const getRifasBuyers = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM buyers_rifa");
    return res.status(200).json({
      error: false,
      response: rows,
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      response:
        "La ruta solicitada no esta disponible temporalmente debido a un error inesperado",
    });
  }
};

export const getBuyerRifaId = async (req, res) => {
  const { boleto, rifa } = req.query;
  try {
    const [winners] = await pool.query(
      "SELECT * FROM winners_rifa WHERE boleto = ?",
      [boleto]
    );

    if (winners.length === 0) {
      const [query] = await pool.query(
        "SELECT * FROM buyers_rifa WHERE boleto = ?",
        [boleto]
      );
      if (query.length > 0) {
        const { nombre, apellido, cedula } = query[0];
        res.status(200).json({
          error: false,
          user: {
            nombre,
            apellido,
            cedula,
          },
        });
      } else {
        res.status(404).json({
          error: true,
          message: "No existe compra registrada con ese numero de boleto",
        });
      }
    } else {
      res.status(200).json({
        error: true,
        message: "Dicha persona ya fue registrada como ganador",
      });
    }
  } catch (error) {
    return res.status(500).json({
      error: true,
      info: {
        message:
          "La ruta solicitada no esta disponible temporalmente debido a un error inesperado",
      },
    });
  }
};

/**
 *  Para Registrar una nueva compra de Rifa
 */
export const comprarRifa = async (req, res) => {
  console.log("quiere comprar Rifa");
  try {
    const { nombre, apellido, cedula, telefono, boletos } = req.body;
    let decodedStringBoleto = atob(boletos);
    const compra = JSON.parse(decodedStringBoleto);

    let notInserts = [];
    let inserts = [];
    let id_compra = uuidv4();

    for (let i = 0; i < compra.length; i++) {
      const ticket = compra[i];
      const [query] = await pool.query(
        "SELECT * FROM buyers_rifa WHERE boleto = ?",
        [ticket]
      );
      if (query.length === 0) {
        // Si no se ha comprado ese Numero de Boleto procedo a Insertar
        const [rows] = await pool.query(
          "INSERT INTO buyers_rifa (nombre,apellido,cedula,telefono,boleto,id_compra) VALUES (?,?,?,?,?,?)",
          [nombre, apellido, cedula, telefono, ticket, id_compra]
        );
        console.log(rows);
        if (rows.affectedRows === 1) {
          inserts.push(ticket);
        }

        // Luego de Insertar al comprador debo verificar si dicho numero de afiliado existe en la tabla de afiliados
      } else {
        notInserts.push(ticket);
      }
    }
    res.status(200).json({
      error: false,
      info: {
        solicitud_compra: compra,
        notInserts,
        inserts,
      },
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      info: {
        message:
          "La ruta solicitada no esta disponible temporalmente debido a un error inesperado",
      },
    });
  }
};

export const sseRifa = (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  // Agregar este cliente al conjunto
  clients.add(res);
  console.log(`Cliente conectado. Total: ${clients.size}`);

  // Eliminar cliente cuando se desconecte
  req.on("close", () => {
    clients.delete(res);
    console.log(`Cliente desconectado. Total: ${clients.size}`);
  });
};

export const updateStatusRifa = async (req,res) => {
    const { newStatus , id }  = req.body

  try {
    const [result] = await pool.query(
      "UPDATE rifa SET status = ?  WHERE id = ?",
      [newStatus, id]
    );

    if (result.affectedRows === 0) {
      return res.status(200).json({
        error: true,
        response: "No se pudo actualizar el estado de la Rifa",
      });
    }

    return res.status(200).json({
      error: false,
      response: "estado de la rifa actualizado exitosamente",
    });

  } catch (error) {
    if (error) {
      return res.status(500).json({
        error: true,
        response: "Ha ocurrido temporalmente debido a un error inesperado",
      });
    }
  
  }

}

// method PUT para actualizar una pregunta
export const updateRifa = async (req, res) => {
  const { id } = req.params;
  const { date, hour, name } = req.body;

  try {
    const [result] = await pool.query(
      "UPDATE rifa SET nombre = ?, fecha = ?, hora = ?  WHERE id = ?",
      [name, date, hour, id]
    );

    if (result.affectedRows === 0) {
      return res.status(200).json({
        error: true,
        response: "No se pudo actualizar la Rifa",
      });
    }
    const [rows] = await pool.query(
      "SELECT * FROM rifa ORDER BY STR_TO_DATE(CONCAT(fecha, ' ', hora), '%m/%d/%Y %H:%i') DESC LIMIT 1"
    );
    if (rows.length > 0) {
      const newDataRifa = rows[0]
      // 2. Notificar a TODOS los clientes conectados via SSE
      clients.forEach((client) => {
        client.write("event: rifaActualizada\n");
        client.write(`data: ${JSON.stringify(newDataRifa)}\n\n`);
      });
    }

    return res.status(200).json({
      error: false,
      response: "La rifa se ha Actualizado correctamente",
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      error: true,
      response: "Ha ocurrido temporalmente debido a un error inesperado",
    });
  }
};

// method DELETE para borrar una pregunta
export const deleteCustomer = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query("DELETE FROM buyers WHERE id = ?", [id]);

    if (result.affectedRows === 0)
      return res.status(404).json({
        message: "No se encontro el empleado",
      });

    // si ya actualizo envio cuales fueron los datos actualizados
    const [rows] = await pool.query("SELECT * FROM buyers WHERE id = ?", [id]);

    res.json(rows[0]);
  } catch (error) {
    return res.status(500).json({
      message:
        "La ruta solicitada no esta disponible temporalmente debido a un error inesperado",
    });
  }
};

// Funcion que retorna la Cotizacion del Dolar mediante un modulo npm
export const getPriceDolar = async (req, res) => {
  try {
    const data = await getMonitor("EnParaleloVzla", "price", false);

    res.status(200).json({
      dolarPrice: data.enparalelovzla,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const getPremios = async (req, res) => {
  const { admin } = req.query; // este parametro es solo cuando se desea agregar un nuevo ganador y asociarlo a un premio

  try {
    // 1. Obtener el ID de la rifa más reciente (comprobar si hay una rifa activa actualizada)
    const queryId =
      "SELECT * FROM rifa ORDER BY STR_TO_DATE(CONCAT(fecha, ' ', hora), '%m/%d/%Y %H:%i') DESC LIMIT 1";
    const [rifaRows] = await pool.query(queryId);
    const rifaId = rifaRows[0]?.id; // Extraer el ID del primer resultado
    const status = rifaRows[0]?.status

    if (!rifaId || (status !== 'active' && status !== 'proccess' )) {
      return res.status(200).json({
        error: true,
        response: {
          message:
            "No se encontro registro de ninguna Rifa Activa por el momento no hay premios disponibles",
        },
      });
    }

   

    // Comprobar si existen premios asociados a esa Rifa
  
    const [premiosRows] = await pool.query(
      "SELECT * FROM premios WHERE id_rifa = ?",
      [rifaId]
    );


    if (premiosRows.length === 0 && !admin && status === 'active') {
      return res.status(200).json({
        error: true,
        response: {
          status,
          message:
            "Estamos creando una Nueva Rifa, en muy poco se publicaran los premios lo mas pronto posible",
        },
      });
    }

    // 2. Consulta de premios
    let query;
    let params = [];

    if (admin) {
      query =
        "SELECT p.* FROM premios p LEFT JOIN temporal_winners_rifa w ON p.id = w.id_premio WHERE w.id_premio IS NULL AND p.id_rifa = ? ORDER BY p.number_premio ASC";
      params = [rifaId];
    } else {
      query =
        "SELECT * FROM premios INNER JOIN rifa ON premios.id_rifa = rifa.id WHERE id_rifa = ?";
      params = [rifaId];
    }

    // 3. Ejecutar la consulta
    const [result] = await pool.query(query, params);
    console.log(result);
    const premio_principal = result.filter(
      (item) => item.tipo === "premio_principal"
    );
    const premio_sorpresa = result.filter(
      (item) => item.tipo === "premio_sorpresa"
    );
    const primeros_eliminados = result.filter(
      (item) => item.tipo === "primeros_eliminados"
    );

    return res.status(200).json({
      error: false,
      response: {
        premios: 0,
        statusRifa:status,
        rifaId,
        nombreRifa: rifaRows[0].nombre,
        fecha: rifaRows[0].fecha,
        premio_principal,
        premio_sorpresa,
        primeros_eliminados,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: true,
      response:
        "La ruta solicitada no esta disponible temporalmente debido a un error inesperado",
    });
  }
};

export const createPremio = async (req, res) => {
  const { title, description, premioNumber, type_premio, rifaId } = req.body;
  const { nameImage } = saveImage(req.file);
  try {
    const [rows] = await pool.query(
      "INSERT INTO premios (tipo,titulo,descripcion,imagen,number_premio,id_rifa) VALUES (?,?,?,?,?,?)",
      [type_premio, title, description, nameImage, premioNumber, rifaId]
    );
    //const [query] = await pool.query('SELECT * FROM buyers_rifa WHERE boleto = ?', [ticket])
    if (rows.affectedRows === 0) {
      return res.status(500).json({
        error: true,
        response: "No se pudo crear el recurso",
      });
    } else {
      res.status(200).json({
        error: false,
        response: "El premio se ha registrado correctamente",
      });
    }
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: "Ha ocurrido temporalmente debido a un error inesperado",
    });
  }
};

export const updatePremio = async (req, res) => {
  const body = req.body;
  const id = body.id;
  try {
    const [rows] = await pool.query("SELECT * FROM premios WHERE id = ?", [id]);
    let image;
    if (req.file) {
      const { nameImage } = saveImage(req.file);
      image = nameImage;
      console.log(image);
    } else {
      image = rows[0].imagen;
    }

    console.log(image);
    const title = body.title ? body.title : rows[0].titulo;
    const description = body.description
      ? body.description
      : rows[0].descripcion;

    const [result] = await pool.query(
      "UPDATE premios SET titulo = ?, descripcion = ?, imagen = ?  WHERE id = ?",
      [title, description, image, id]
    );

    if (result.affectedRows === 0) {
      return res.status(200).json({
        error: true,
        response: "No se encontro registro con ese id",
      });
    }
    res.status(200).json({
      error: false,
      response: "Premio actualizado correctamente",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: true,
      response: "Ha ocurrido temporalmente debido a un error inesperado",
    });
  }
};

export const addNewRifa = async (req, res) => {
  const { date, hour, name } = req.body;
  console.log(req.body);
  const nombre = name || "Super Rifa";
  try {
    const [rows] = await pool.query(
      "INSERT INTO rifa (nombre,fecha,hora) VALUES (?,?,?)",
      [nombre, date, hour]
    );
    if (rows.affectedRows === 0) {
      return res.status(200).json({
        error: true,
        response: "No se pudo crear el recurso",
      });
    } else {
      const [rows] = await pool.query(
        "SELECT * FROM rifa ORDER BY STR_TO_DATE(CONCAT(fecha, ' ', hora), '%m/%d/%Y %H:%i') DESC LIMIT 1"
      );
      if (rows.length > 0) {
        const newDataRifa = rows[0]
        // 2. Notificar a TODOS los clientes conectados via SSE
        clients.forEach((client) => {
          client.write("event: rifaCreada\n");
          client.write(`data: ${JSON.stringify(newDataRifa)}\n\n`);
        });
       }
      return res.status(200).json({
        error: false,
        response: "La hora de la rifa se ha registrado correctamente",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: true,
      response: "Ha ocurrido temporalmente debido a un error inesperado",
    });
  }
};

/**
 * Valida si una rifa está vigente (considerando hora exacta en Venezuela).
 * @param {string} fechaStr - Formato "MM/DD/YYYY" (ej: "07/20/2024").
 * @param {string} horaStr - Formato "HH:mm" (ej: "18:25" para 6:25 PM).
 * @returns {boolean} - `true` si la rifa está vigente, `false` si ya expiró.
 */

/*
export function validarVigenciaRifa(fechaStr, horaStr) {
  // 1. Parsear fecha y hora (formato: "YYYY-MM-DD" y "HH:mm")
  const [anio, mes, dia] = fechaStr.split("-");
  const [horas, minutos] = horaStr.split(":");

  // 2. Crear objeto moment en zona horaria de Venezuela (CON SEGUNDOS)
  const rifaDateTime = moment.tz(
    {
      year: anio,
      month: mes - 1, // Restar 1 porque meses en moment son 0-11
      day: dia,
      hour: horas,
      minute: minutos,
      second: 0, // Opcional: forzar segundos a 0 si no se especifican
    },
    "America/Caracas"
  );

  // 3. Obtener hora actual en Venezuela (CON SEGUNDOS)
  const ahoraVenezuela = moment().tz("America/Caracas");

  // 4. Debug: Mostrar fechas con segundos
  console.log("Rifa:", rifaDateTime.format("YYYY-MM-DD HH:mm:ss"));
  console.log("Ahora:", ahoraVenezuela.format("YYYY-MM-DD HH:mm:ss"));

  // 5. Comparación exacta (incluyendo segundos)
  return rifaDateTime.isSameOrAfter(ahoraVenezuela);
}

*/

export const getRifa = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM rifa ORDER BY STR_TO_DATE(CONCAT(fecha, ' ', hora), '%m/%d/%Y %H:%i') DESC LIMIT 1"
    );
     
    if (!req && !res)
      return {
        error: false,
        status:rows.length > 0 ? rows[0].status:'inactive',
        response: rows.length > 0 ? rows : [],
      };
    return res.status(200).json({
      error: false,
      status:rows.length > 0 ? rows[0].status:'inactive',
      response: rows.length > 0 ? rows : [],
    });
  } catch (error) {
    if (!req && !res)
      return {
        error: true,
        response:
          "La ruta solicitada no esta disponible temporalmente debido a un error inesperado",
      };
    return res.status(500).json({
      error: true,
      response:
        "La ruta solicitada no esta disponible temporalmente debido a un error inesperado",
    });
  }
};

// busca el listado de los ganadores del sorteo
export const getLastWinnersRifa = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM winners_rifa_history");
    return res.status(200).json({
      error: false,
      response: rows,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: true,
      response:
        "La ruta solicitada no esta disponible temporalmente debido a un error inesperado",
    });
  }
};

export const updateVideoRifa = async (req, res) => {
  const { id, urlVideoSorteo } = req.body;
  try {
    const [result] = await pool.query(
      "UPDATE winners_rifa SET url_video = ? WHERE id = ?",
      [urlVideoSorteo, id]
    );

    if (result.affectedRows > 0) {
      res.status(200).json({
        error: false,
        response: "Usuario actualizado correctamente",
      });
    } else {
      res.status(200).json({
        error: true,
        response: "No se encontro un usuario con ese id",
      });
    }
  } catch (error) {
    return res.status(500).json({
      error: true,
      response:
        "La ruta solicitada no esta disponible temporalmente debido a un error inesperado",
    });
  }
};

export const addWinnerRifa = async (req, res) => {
  const { nombre, apellido, cedula, boleto, id_premio } = req.body;
  try {
    const [query] = await pool.query(
      "SELECT * FROM  winners_rifa WHERE boleto = ?",
      [boleto]
    );
    if (query.length === 0) {
      const [rows] = await pool.query(
        "INSERT INTO winners_rifa (nombre,apellido,cedula,boleto,id_premio) VALUES (?,?,?,?,?)",
        [nombre, apellido, cedula, boleto, id_premio]
      );
      if (rows.affectedRows === 1) {
        res.status(200).json({
          error: false,
          message: "registro exitoso",
        });
      } else {
        res.status(200).json({
          error: true,
          message: "El usuario no pudo registrarse",
        });
      }
    } else {
      res.status(200).json({
        error: true,
        message: "Este ganador de Rifa ya fue registrado",
      });
    }
  } catch (error) {
    res.status(500).json({
      error: true,
      message: "Ocurrio un error inesperado. Intentalo mas tarde",
    });
  }
};
