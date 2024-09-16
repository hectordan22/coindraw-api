import { Router } from "express";


const router = Router()

import { pagar, 
    updateCustomer, 
    deleteCustomer,
    getCustomer, 
    getPriceDolar } from '../controllers/rifas.controller.js'

router.get('/coindraw/getCustomer/:id', getCustomer)

router.get('/coindraw/pagar', pagar)

router.put('/coindraw/updateCustomer/:id', updateCustomer)

router.delete('/coindraw/deleteCustomer/:id', deleteCustomer)

router.get('/coindraw/getDolar', getPriceDolar)
// exporto las rutas para que se usen desde index.js
export default router