import { Router } from "express";


const router = Router()

import { 
    updateCustomer, 
    deleteCustomer,
    getPriceDolar ,
    getRifasBuyers,
    comprarRifa,
    getBuyerRifaId
} from '../controllers/rifas.controller.js'


router.put('/coindraw/updateCustomer/:id', updateCustomer)

router.delete('/coindraw/deleteCustomer/:id', deleteCustomer)

router.get('/coindraw/getDolar', getPriceDolar)

router.get('/coindraw/getRifasBuyers', getRifasBuyers)

router.get('/coindraw/getBuyerRifaId', getBuyerRifaId)

router.post('/coindraw/comprarRifa', comprarRifa)
// exporto las rutas para que se usen desde index.js
export default router