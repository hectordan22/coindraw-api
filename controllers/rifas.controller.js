// libreria o modulo que nos ayuda con la conexion a la Base de Datos
import { pool } from '../db.js'

// Modulo que nos ayuda a generar un id unico en automatico
/* import { v4 as uuidv4 } from 'uuid'; */

// Modulo que me trae el precio del Dolar Paralelo Venezuela
import { getMonitor } from 'consulta-dolar-venezuela';


// metodo para obtener un cliente por ID

export const getCustomer = async (req, res) => {
    const id = req.params.id
    console.log(id)
    try {
        // si ya actualizo envio cuales fueron los datos actualizados
        const [rows] = await pool.query('SELECT * FROM buyers WHERE boleto = ?', [id])
        /* console.log(rows[0]) */
        if (rows.length === 0) {
            return res.status(200).json({
                error: false,
                disponible: true
            })
        }
        return res.status(200).json({
            error: false,
            disponible: false
        })
    } catch (error) {
        return res.status(500).json({
            error: true,
            message: 'La ruta solicitada no esta disponible temporalmente debido a un error inesperado'
        })
    }
}

export const pagar = async (req, res) => {
    const {
        amount
    } = req.query

    res.render("pagar", {
        amount
    })
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