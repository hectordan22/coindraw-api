// libreria o modulo que nos ayuda con la conexion a la Base de Datos
import { pool } from '../db.js'

// Modulo que nos ayuda a generar un id unico en automatico
import { v4 as uuidv4 } from 'uuid';

// Modulo que me trae el precio del Dolar Paralelo Venezuela
import { getMonitor } from 'consulta-dolar-venezuela';


/** 
 * Muestra todos los compradores de las Rifas
 */
export const getRifasBuyers = async (req, res) => {
    console.log('se llama a todos los que compraron Rifas')
    try {
        const [rows] = await pool.query('SELECT * FROM buyers_rifa')
        setTimeout(() => {
            return res.status(200).json({
                error: false,
                response: rows
            })
        }, 5000);


    } catch (error) {
        setTimeout(() => {
            return res.status(500).json({
                error: true,
                response: 'La ruta solicitada no esta disponible temporalmente debido a un error inesperado'
            })
        }, 5000);

    }
}

export const getBuyerRifaId = async (req,res) => {
    const boleto = req.params.boleto
    const [query] = await pool.query('SELECT * FROM buyers_rifa WHERE boleto = ?', [boleto])
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


/**
 *  Para Registrar una nueva compra de Rifa
 */
export const comprarRifa = async (req, res) => {
    console.log('quiere comprar Rifa')
    try {
        const { nombre, apellido, cedula, telefono, boletos } = req.body
        let decodedStringBoleto = atob(boletos);
        const compra = JSON.parse(decodedStringBoleto)

        let notInserts = []
        let inserts = []
        let id_compra = uuidv4()

        for (let i = 0; i < compra.length; i++) {
            const ticket = compra[i];
            const [query] = await pool.query('SELECT * FROM buyers_rifa WHERE boleto = ?', [ticket])
            if (query.length === 0) {
                // Si no se ha comprado ese Numero de Boleto procedo a Insertar
                const [rows] = await pool.query('INSERT INTO buyers_rifa (nombre,apellido,cedula,telefono,boleto,id_compra) VALUES (?,?,?,?,?,?)', [nombre, apellido, cedula, telefono, ticket, id_compra])
                console.log(rows)
                if (rows.affectedRows === 1) {
                    inserts.push(ticket)
                }

                // Luego de Insertar al comprador debo verificar si dicho numero de afiliado existe en la tabla de afiliados
            } else {
                notInserts.push(ticket)
            }
        }
        res.status(200).json({
            error: false,
            info: {
                solicitud_compra: compra,
                notInserts,
                inserts
            }
        })
    }catch(error){
        return res.status(500).json({
            error: true,
            info: {
                message: 'La ruta solicitada no esta disponible temporalmente debido a un error inesperado'
            }

        })
    }
}




// method PUT para actualizar una pregunta
export const updateCustomer = async (req, res) => {
    const { id } = req.params
    const { nombre, apellido, cedula, telefono } = req.body

    try {
        const [result] = await pool.query('UPDATE buyers SET nombre = ?, apellido = ?, cedula = ?, telefono = ?  WHERE id = ?', [nombre, apellido, cedula, telefono, id])

        if (result.affectedRows === 0) return res.status(404).json({
            message: 'No se encontro el empleado'
        })

        res.sendStatus(204)
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({
            message: 'Ha ocurrido temporalmente debido a un error inesperado'
        })
    }
}


// method DELETE para borrar una pregunta
export const deleteCustomer = async (req, res) => {

    const { id } = req.params

    try {
        const result = await pool.query('DELETE FROM buyers WHERE id = ?', [id]);


        if (result.affectedRows === 0) return res.status(404).json({
            message: 'No se encontro el empleado'
        })

        // si ya actualizo envio cuales fueron los datos actualizados
        const [rows] = await pool.query('SELECT * FROM buyers WHERE id = ?', [id])

        res.json(rows[0])

    } catch (error) {
        return res.status(500).json({
            message: 'La ruta solicitada no esta disponible temporalmente debido a un error inesperado'
        })
    }
}

// Funcion que retorna la Cotizacion del Dolar mediante un modulo npm
export const getPriceDolar = async (req, res) => {
    try {
        const data = await getMonitor("EnParaleloVzla", "price", false);

        res.status(200).json({
            dolarPrice: data.enparalelovzla
        })

    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
}