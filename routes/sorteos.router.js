import { Router } from 'express'


// importo las funciones controladoras de la ruta

import {
    getSorteoBuyers,
    comprarSorteo,
    getBuyerSorteoId,
    addWinnerSorteo,
    getLastWinnersSorteo,
    updateVideoSorteo
 } from '../controllers/sorteos.controller.js'

const router = Router()


router.get('/coindraw/getSorteoBuyers', getSorteoBuyers)
router.get('/coindraw/getBuyerId/:boleto', getBuyerSorteoId)
router.get('/coindraw/getLastWinnersSorteo', getLastWinnersSorteo)
router.post('/coindraw/comprarSorteo', comprarSorteo)
router.post('/coindraw/addWinnerSorteo', addWinnerSorteo)
router.put('/coindraw/updateVideoSorteo', updateVideoSorteo)




// exporto las rutas para que se usen desde index.js
export default router