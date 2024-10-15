// libreria o modulo que nos ayuda con la conexion a la Base de Datos
import { pool } from '../db.js'

// Modulo que nos ayuda a generar un id unico en automatico
import { v4 as uuidv4 } from 'uuid';

// Muestra todos los compradores de sorteo

export const getSorteoBuyers = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM buyers_sorteo')
        setTimeout(() => {
            return res.status(200).json({
                error: false,
                response: rows
            })
        }, 5000);


    } catch (error) {
        console.log(error)
        setTimeout(() => {
            return res.status(500).json({
                error: true,
                response: 'La ruta solicitada no esta disponible temporalmente debido a un error inesperado'
            })
        }, 5000);

    }

}

// busca el listado de los ganadores del sorteo
export const getLastWinnersSorteo = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM winners_sorteo ORDER BY fecha DESC LIMIT 6')
        setTimeout(() => {
            return res.status(200).json({
                error: false,
                response: rows
            })
        }, 3000);


    } catch (error) {
        console.log(error)
        setTimeout(() => {
            return res.status(500).json({
                error: true,
                response: 'La ruta solicitada no esta disponible temporalmente debido a un error inesperado'
            })
        }, 3000);

    }

}

export const getBuyerSorteoId = async (req,res) => {
    const boleto = req.params.boleto
    const [query] = await pool.query('SELECT * FROM buyers_sorteo WHERE boleto = ?', [boleto])
    console.log(query)
    setTimeout(() => {
        if (query.length != 0) {
           const {nombre, apellido, cedula} = query[0] 
            res.status(200).json({
                error:false,
                user:{
                  nombre,
                  apellido,
                  cedula
                }
              })
        }else{
            res.status(404).json({
               error:true,
               message:'El usuario no fue encontrado'
            })
        }
       
    },3000)
    
}

export const addWinnerSorteo = async (req,res) => {
    const {nombre, apellido,cedula, boleto} = req.body
    try {
        const [query] = await pool.query('SELECT * FROM winners_sorteo WHERE boleto = ?', [boleto])
        if (query.length === 0) {
            const [rows] = await pool.query('INSERT INTO winners_sorteo (nombre,apellido,cedula,boleto) VALUES (?,?,?,?)', [nombre, apellido, cedula, boleto])
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
                message: 'La persona que intentas registrar como ganador del sorteo ya fue registrada'
            })
        }
    } catch (error) {
        res.status(500).json({
            error:true,
            message: 'Ocurrio un error inesperado. Intentalo mas tarde'
        })
    } 
}


// method POST para registrar una nuevo comprador de sorteo
export const comprarSorteo = async (req, res) => {
    console.log(req.body)

    try {
        const { nombre, apellido, cedula, telefono, boletos, afiliado } = req.body
        let decodedStringBoleto = atob(boletos);
        const compra = JSON.parse(decodedStringBoleto)

        let notInserts = []
        let inserts = []
        let personaBoletoGratis = {}
        let id_compra = uuidv4()
        let id_afiliado = uuidv4()
        

        for (let i = 0; i < compra.length; i++) {
            const ticket = compra[i];
            const [query] = await pool.query('SELECT * FROM buyers_sorteo WHERE boleto = ?', [ticket])
            if (query.length === 0) {
                // Si no se ha comprado ese Numero de Boleto procedo a Insertar
                const [rows] = await pool.query('INSERT INTO buyers_sorteo (nombre,apellido,cedula,telefono,boleto,id_compra,referido_por) VALUES (?,?,?,?,?,?,?)', [nombre, apellido, cedula, telefono, ticket, id_compra, afiliado])
                console.log(rows)
                if (rows.affectedRows === 1) {
                    inserts.push(ticket)
                }

                // Luego de Insertar al comprador debo verificar si dicho numero de afiliado existe en la tabla de afiliados
            } else {
                notInserts.push(ticket)
            }
        }

        await pool.query('INSERT INTO afiliates (id_afiliate, id_compra) VALUES (?,?)', [id_afiliado, id_compra])

        if (afiliado != 'none') {
            const [result] = await pool.query('SELECT * FROM afiliates WHERE id_afiliate = ?', [afiliado])
            // solo actualizo el  campo de alcanzados  si realmente existe ese id 
            if (result.length === 1) {
                // Obtengo el numero de Alcanzados que tiene y le sumo uno
                const newAlcanzado = parseInt(result[0].alcanzados) + 1
               
                // Luego actualizo solo el campo de Alcanzados
                await pool.query('UPDATE afiliates SET alcanzados = ?  WHERE id_afiliate = ?', [newAlcanzado, afiliado])
                // si ya llego a los 10 referidos entonces actualizo el proximo registro gratis y le asigno un numero gratis
                console.log(result[0].proximo_premio)
                console.log(newAlcanzado)

                if (newAlcanzado === parseInt(result[0].proximo_premio)) {
                //obtengo los datos de la persona que llego a los 10 referidos
                const [coincidences] = await pool.query('SELECT nombre, apellido, cedula, telefono FROM buyers_sorteo INNER JOIN afiliates ON buyers_sorteo.id_compra = afiliates.id_compra  WHERE id_afiliate = ?', [afiliado])
                personaBoletoGratis = coincidences[0]
                //actualizo solo el campo de Alcanzados
                let new_premio = newAlcanzado + 10
                await pool.query('UPDATE afiliates SET proximo_premio = ?  WHERE id_afiliate = ?', [new_premio, afiliado])
                }
            }
        }

        let preparing_url = id_afiliado.slice(0, 20)
    
        res.status(200).json({
            error: false,
            info: {
                solicitud_compra: compra,
                notInserts,
                inserts,
                enlace_afiliado: `http://localhost:5173/sorteo/${preparing_url}`,
                personaBoletoGratis:Object.keys(personaBoletoGratis).length > 0 ? personaBoletoGratis : 'no aplica'
            },

        })

    } catch (error) {
        return res.status(500).json({
            error: true,
            info: {
                message: 'La ruta solicitada no esta disponible temporalmente debido a un error inesperado'
            }

        })
    }

}

export const updateVideoSorteo = async (req,res) => {
    const {id, urlVideoSorteo} = req.body
    try {
        const [result] = await pool.query('UPDATE winners_sorteo SET url_video = ? WHERE id = ?', [urlVideoSorteo, id]);
      
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





