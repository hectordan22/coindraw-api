// libreria o modulo que nos ayuda con la conexion a la Base de Datos
import { pool } from '../db.js'

// Modulo que nos ayuda a generar un id unico en automatico
import { v4 as uuidv4 } from 'uuid';

// Muestra todos los compradores de sorteo

export const getSorteoBuyers = async (req, res) => {
    console.log('se llama a todos los que compraron Sorteo')
    try {
        const [rows] = await pool.query('SELECT * FROM buyers_sorteo')
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


// Verifica si se ha Realizado una compra para crear una url personalizada para Referidos
export const searchTicket = async (req, res) => {
    const id_compra = req.params.id_compra
    try {
        // Compruebo que el usuario realmente Haya comprado un Boleto
        const [rows] = await pool.query('SELECT * FROM buyers WHERE id_compra = ?', [id_compra])
        /* console.log(rows[0]) */
        if (rows.length === 0) {
            return res.status(200).json({
                error: true,
                message: 'Solo puedes Generar enlace personalizado si has comprado un boleto'
            })
        }
        // Si el usuario Si realizo una compra pero quiere generar un enlace de nuevo
        const [results] = await pool.query('SELECT * FROM buyers_sorteo WHERE id_compra = ? AND enlace = ?', [boleto, 0])
        // No se puede permitir
        if (results.length === 0) {
            return res.status(200).json({
                error: true,
                message: 'Estimado usuario solo puede Generar un enlace por Compra de Boleto'
            })
        }
        // Hago Consulta para colocar enlace de esa compra como creado

        const [result] = await pool.query('UPDATE buyers_sorteo SET enlace = ? WHERE boleto = ?', [1, boleto])
        // Si hubo un error y no se registro la compra
        if (result.affectedRows === 0) return res.status(404).json({
            error: true,
            enlace: false,
            message: 'No se pudo Generar el enlace. Intenta Nuevamente'
        })

        // Si no hubo ningun error significa que lo creo correctamente: Entonces procedo a registrar en la tabla de afiliados


        try {
            let id_enlace = uuidv4()
            const [afiliate] = await pool.query('INSERT INTO afiliates (id_afiliate,alcanzados,id_boleto) VALUES (?,?,?)', [id_enlace, 0, boleto])
            return res.status(200).json({
                error: false,
                enlace: true,
                data: rows[0],
                id_enlace: id_enlace
            })
        } catch (error) {
            return res.status(500).json({
                error: true,
                enlace: false,
                message: 'La ruta solicitada no esta disponible temporalmente debido a un error inesperado'
            })
        }

    } catch (error) {
        return res.status(500).json({
            error: true,
            enlace: false,
            message: 'La ruta solicitada no esta disponible temporalmente debido a un error inesperado'
        })
    }
}




