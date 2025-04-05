// libreria o modulo que nos ayuda con la conexion a la Base de Datos
import { pool } from "../db.js";

// Modulo que nos ayuda a generar un id unico en automatico
import { v4 as uuidv4 } from "uuid";

// Modulo que me trae el precio del Dolar Paralelo Venezuela
import { getMonitor } from "consulta-dolar-venezuela";

import fs from 'fs';

const saveImage = (file) => {
    let cleanName = file.originalname.replace(" ", "-");
    const newPath = `./public/premios/${cleanName}` 
    fs.renameSync(file.path, newPath)
    return { 
     nameImage:cleanName
    }
 }

/**
 * Muestra todos los compradores de las Rifas
 */
export const getRifasBuyers = async (req, res) => {
  console.log("se llama a todos los que compraron Rifas");
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
  const boleto = req.params.boleto;
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
    }else{
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

// method PUT para actualizar una pregunta
export const updateCustomer = async (req, res) => {
  const { id } = req.params;
  const { nombre, apellido, cedula, telefono } = req.body;

  try {
    const [result] = await pool.query(
      "UPDATE buyers SET nombre = ?, apellido = ?, cedula = ?, telefono = ?  WHERE id = ?",
      [nombre, apellido, cedula, telefono, id]
    );

    if (result.affectedRows === 0)
      return res.status(404).json({
        message: "No se encontro el empleado",
      });

    res.sendStatus(204);
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      message: "Ha ocurrido temporalmente debido a un error inesperado",
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
  const { addWinner } = req.query // este parametro es solo cuando se desea agregar un nuevo ganador y asociarlo a un premio

  try {
   const query = addWinner ? 
   "SELECT p.* FROM premios p LEFT JOIN winners_rifa w ON p.id = w.id_premio WHERE w.id_premio IS NULL ORDER BY number_premio ASC":
   "SELECT * FROM premios"
   const [result] = await pool.query(query);
    console.log(result)
    const premio_principal = result.filter(
      (item) => item.tipo === "premio_principal"
    );
    const premio_sorpresa = result.filter(
      (item) => item.tipo === "premio_sorpresa"
    );
    const primeros_eliminados = result.filter(
      (item) => item.tipo === "primeros_eliminados"
    );

      res.status(200).json({
        error: false,
        response: {
          premio_principal,
          premio_sorpresa,
          primeros_eliminados,
        },
      });
  } catch (error) {
    console.log(error)
      return res.status(500).json({
        error: true,
        response:
          "La ruta solicitada no esta disponible temporalmente debido a un error inesperado",
      });
  }
};

export const createPremio = async (req, res) => {
  const { title, description, premioNumber, type_premio } = req.body;
  const { nameImage } = saveImage(req.file);
  try {
    const [rows] = await pool.query(
        "INSERT INTO premios (tipo,titulo,descripcion,imagen,number_premio) VALUES (?,?,?,?,?)",
        [type_premio, title, description, nameImage, premioNumber]
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
        error:true,
        message: "Ha ocurrido temporalmente debido a un error inesperado",
      });
  }
 
};

export const updatePremio = async (req, res) => {
  const body = req.body;
  const id = body.id;
  try {
    const [rows] = await pool.query("SELECT * FROM premios WHERE id = ?", [id]);
     let image 
    if (req.file) {
      const { nameImage } = saveImage(req.file);
      image = nameImage
      console.log(image)
    }else{
      image = rows[0].imagen;
    }
    
     console.log(image)
    const title = body.title ? body.title : rows[0].titulo;
    const description = body.description? body.description: rows[0].descripcion;

    const [result] = await pool.query(
      "UPDATE premios SET titulo = ?, descripcion = ?, imagen = ?  WHERE id = ?",
      [title, description, image, id]
    );

    if (result.affectedRows === 0){
      return res.status(200).json({
        error:true,
        response: "No se encontro registro con ese id",
      });
    }
    res.status(200).json({
      error:false,
      response:'Premio actualizado correctamente'
    })
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      error:true,
      response: "Ha ocurrido temporalmente debido a un error inesperado",
    });
  }

};

export const addNewRifa = async (req,res) => {
  const {date,hour,name} = req.body
  console.log(req.body)
  const nombre = name || 'Super Rifa'
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
        return res.status(200).json({
          error: false,
          response: "La hora de la rifa se ha registrado correctamente",
        });
    }
  } catch (error) {
    console.log(error)
      return res.status(500).json({
        error:true,
        response: "Ha ocurrido temporalmente debido a un error inesperado",
      });
  }
}

export const getRifa = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM rifa");
    if(!req && !res) return {
      error: false,
      response: rows
    }
      return res.status(200).json({
        error: false,
        response: rows
      });
  } catch (error) {
    if(!req && !res) return {
      error: true,
      response:
        "La ruta solicitada no esta disponible temporalmente debido a un error inesperado"
    }
      return res.status(500).json({
        error: true,
        response:
          "La ruta solicitada no esta disponible temporalmente debido a un error inesperado"
      });
  }
};

// busca el listado de los ganadores del sorteo
export const getLastWinnersRifa = async (req, res) => {
  try {
      const [rows] = await pool.query('SELECT winners_rifa.nombre, winners_rifa.id, winners_rifa.apellido, winners_rifa.cedula,winners_rifa.boleto, winners_rifa.url_video, winners_rifa.fecha, premios.tipo AS tipo_premio, premios.descripcion FROM winners_rifa INNER JOIN premios ON winners_rifa.id_premio = premios.id')
          return res.status(200).json({
              error: false,
              response: rows
          })
  } catch (error) {
      console.log(error)
          return res.status(500).json({
              error: true,
              response: 'La ruta solicitada no esta disponible temporalmente debido a un error inesperado'
          })
  }

}

export const updateVideoRifa = async (req,res) => {
  const {id, urlVideoSorteo} = req.body
  try {
      const [result] = await pool.query('UPDATE winners_rifa SET url_video = ? WHERE id = ?', [urlVideoSorteo, id]);
    
      if (result.affectedRows > 0) {
        res.status(200).json({
          error:false,
          response:'Usuario actualizado correctamente'
        })
      } else {
          res.status(200).json({
              error:true,
              response:'No se encontro un usuario con ese id'
          })
      }
    } catch (error) {
      return res.status(500).json({
          error: true,
          response: 'La ruta solicitada no esta disponible temporalmente debido a un error inesperado'
      })
    }
}

export const addWinnerRifa = async (req,res) => {
  const {nombre, apellido,cedula, boleto, id_premio} = req.body
  try {
      const [query] = await pool.query('SELECT * FROM  winners_rifa WHERE boleto = ?', [boleto])
      if (query.length === 0) {
          const [rows] = await pool.query('INSERT INTO winners_rifa (nombre,apellido,cedula,boleto,id_premio) VALUES (?,?,?,?,?)', [nombre, apellido, cedula, boleto,id_premio])
          if(rows.affectedRows === 1){
              res.status(200).json({
                  error:false,
                  message:'registro exitoso'
              })
          }else{
              res.status(200).json({
                  error:true,
                  message:'El usuario no pudo registrarse'
              })
          }
      }else{
          res.status(200).json({
              error:true,
              message: 'Este ganador de Rifa ya fue registrado'
          })
      }
  } catch (error) {
      res.status(500).json({
          error:true,
          message: 'Ocurrio un error inesperado. Intentalo mas tarde'
      })
  } 
}

