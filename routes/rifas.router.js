import { Router } from "express";
import multer from 'multer'


const router = Router()
const upload = multer({dest:'public/premios/'})

import { 
    updateCustomer, 
    deleteCustomer,
    getPriceDolar ,
    getRifasBuyers,
    comprarRifa,
    getBuyerRifaId,
    getPremios,
    createPremio,
    updatePremio
} from '../controllers/rifas.controller.js'

router.get('/getPremios', getPremios)
router.post('/createPremio', upload.single('imagenPremio'), createPremio)
router.put('/updatePremio', upload.single('imagenPremio'), updatePremio)

router.put('/coindraw/updateCustomer/:id', updateCustomer)

router.delete('/coindraw/deleteCustomer/:id', deleteCustomer)

router.get('/coindraw/getDolar', getPriceDolar)

router.get('/coindraw/getRifasBuyers', getRifasBuyers)

router.get('/coindraw/getBuyerRifaId', getBuyerRifaId)

router.post('/coindraw/comprarRifa', comprarRifa)
// exporto las rutas para que se usen desde index.js
export default router