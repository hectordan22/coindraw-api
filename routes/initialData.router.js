import { Router } from 'express'

// importo las funciones controladoras de la ruta

import {
    initialData,
    addVideoInitial,
    getVideoInitial
 } from '../controllers/initialData.controller.js'

const router = Router()


router.get('/initialData', initialData)
router.post('/addVideoInitial', addVideoInitial)
router.get('/getVideoInitial', getVideoInitial)



// exporto las rutas para que se usen desde index.js
export default router