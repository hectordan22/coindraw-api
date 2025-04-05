import { Router } from 'express'
import multer from 'multer'

// importo las funciones controladoras de la ruta
const upload = multer({dest:'public/banner/'})

import {
    initialData,
    addVideoInitial,
    getVideoInitial,
    getBannerInicio,
    editImageBanner,
    addMultiBanner,
    addSingleBanner,
    replaceAllBaner,
    deleteImageBanner,
    getNumberBuyers,
    getLastWinners
 } from '../controllers/initialData.controller.js'

const router = Router()


router.get('/initialData', initialData)
router.post('/addVideoInitial', addVideoInitial)
router.get('/getVideoInitial', getVideoInitial)
router.get('/getNumberBuyersSorteo',getNumberBuyers)
router.get('/getBannerInicio', getBannerInicio)
router.get('/getLastWinners', getLastWinners)
//Agregar varias imagenes
router.post('/addMultiBanner', upload.array('imagenesBanner'),addMultiBanner) 
// remplazar todo el Bannner
router.post('/replaceAllBaner', upload.array('imagenesBannerReplace'),replaceAllBaner)
// Agregar una imagen   
router.post('/addSingleBanner', upload.single('imagenBannerAdd'),addSingleBanner)
// Editar una Imagen
router.put('/editImageBanner', upload.single('imagenBannerEdit'),editImageBanner)
router.delete('/deleteImageBanner',deleteImageBanner)




// exporto las rutas para que se usen desde index.js
export default router