import { Router } from 'express'

// importo las funciones controladoras de la ruta

import {
    initialData,
 } from '../controllers/initialData.controller.js'

const router = Router()


router.get('/initialData', initialData)



// exporto las rutas para que se usen desde index.js
export default router