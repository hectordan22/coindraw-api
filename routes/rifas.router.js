import { Router } from "express";
import multer from 'multer'

const router = Router()
const upload = multer({dest:'public/premios/'})

import { 
    updateRifa, 
    deleteCustomer,
    getPriceDolar ,
    getRifasBuyers,
    comprarRifa,
    getPremios,
    createPremio,
    updatePremio,
    addNewRifa,
    getRifa,
    getLastWinnersRifa,
    updateVideoRifa,
    getBuyerRifaId,
    addWinnerRifa,
    sseRifa,
    updateStatusRifa
} from '../controllers/rifas.controller.js'

router.get('/getPremios', getPremios)
router.post('/createPremio', upload.single('imagenPremio'), createPremio)
router.put('/updatePremio', upload.single('imagenPremio'), updatePremio)


router.delete('/coindraw/deleteCustomer/:id', deleteCustomer)

router.get('/coindraw/getDolar', getPriceDolar)

router.get('/coindraw/getRifasBuyers', getRifasBuyers)

router.post('/coindraw/comprarRifa', comprarRifa)

// Agregar fecha y hora de la rifa
router.post('/addNewRifa', addNewRifa)
router.put('/updateRifa/:id', updateRifa)

// verificar si hay rifa
router.get('/getRifa', getRifa)

router.get('/coindraw/getLastWinnersRifa', getLastWinnersRifa)

router.put('/coindraw/updateVideoRifa', updateVideoRifa)

router.get('/coindraw/getBuyerRifaId', getBuyerRifaId)

router.post('/coindraw/addWinnerRifa', addWinnerRifa)

router.get('/sse-rifa', sseRifa)

router.put('/updateStatusRifa', updateStatusRifa )

// exporto las rutas para que se usen desde index.js
export default router