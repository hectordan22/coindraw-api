import { Router } from 'express'


// importo las funciones controladoras de la ruta

import {
    getSorteoBuyers,
    getRifasBuyers,
    comprarSorteo,
    comprarRifa,
    searchTicket,
 } from '../controllers/customers.controller.js'

const router = Router()


router.get('/coindraw/getSorteoBuyers', getSorteoBuyers)

router.get('/coindraw/getRifasBuyers', getRifasBuyers)

router.get('/coindraw/searchTicket/:id_compra', searchTicket)


router.post('/coindraw/comprarSorteo', comprarSorteo)

router.post('/coindraw/comprarRifa', comprarRifa)


// exporto las rutas para que se usen desde index.js
export default router