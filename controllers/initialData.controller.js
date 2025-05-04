import { pool } from "../db.js";
import fs from "fs";
import {
  getRifa
} from './rifas.controller.js'


export const  getLastWinners = async (req,res) => {
 const seccion =  [
    {
        id: "1",
        title: "Lista De los Ultimos Ganadores del Sorteo",
        videos: []
    },
    {
        id: "2",
        title: "Lista De los Ganadores Principales",
        videos: []
    },
    {
        id: "3",
        title: "Lista de los Ganadores Sorprea",
        videos: []
    },
    {
        id: "4",
        title: "Lista de los Primeros Eliminados",
        videos: []
    }
]
  try {
    const [rows] = await pool.query('SELECT * FROM winners_rifa_history')
    if (rows.length > 0) {
      rows.map((item,index) => {
        
        if (item.tipo_premio === 'premio_principal' ) {
          seccion[1].videos.push({ id: index+1, url: item.url_video, miniatura: 'http://localhost:3000/images/person.jpg', title: `${item.nombre_ganador} ${item.apellido_ganador} ${formatDate(item.fecha)}` })
        }
        if (item.tipo_premio === 'premio_sorpresa' ) {
          seccion[2].videos.push({ id: index+1, url: item.url_video, miniatura: 'http://localhost:3000/images/person.jpg', title: `${item.nombre_ganador} ${item.apellido_ganador} ${formatDate(item.fecha)}` })
        }
        if (item.tipo_premio === 'primeros_eliminados' ) {
          seccion[3].videos.push({ id: index+1, url: item.url_video, miniatura: 'http://localhost:3000/images/person.jpg', title: `${item.nombre_ganador} ${item.apellido_ganador} ${formatDate(item.fecha)}` })
        }
      })
    }
    const [winners] = await pool.query('SELECT * FROM winners_sorteo ORDER BY fecha DESC LIMIT 6')
    if (winners.length > 0) {
      winners.map((item,index) => {
        seccion[0].videos.push({ id: index+1, url: item.url_video, miniatura: 'http://localhost:3000/images/person.jpg', title: `${item.nombre} ${item.apellido} ${formatDate(item.fecha)}` })
     })
    }
     return res.status(200).json({
            error: false,
            response: seccion
    })
} catch (error) {
        return res.status(500).json({
            error: true,
            response: 'La ruta solicitada no esta disponible temporalmente debido a un error inesperado'
        })
}
 
}

function formatDate(date) {
  const fecha = new Date(date);

// Formateador para fecha (31/01/2025)
const formatoFecha = new Intl.DateTimeFormat('es-ES', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric'
}).format(fecha);

// Formateador para hora (12:09 AM)
const formatoHora = new Intl.DateTimeFormat('es-ES', {
  hour: '2-digit',
  minute: '2-digit',
  hour12: true
}).format(fecha);

  return `el ${formatoFecha} a las ${formatoHora}`
}

export const initialData =  async (req, res) => {
  const banner = await getBannerInicio()
  const updateRoutesBanner = !(banner.error) ? banner.response.map(item => {
      return {
        ...item,
        image:`http://localhost:3000/banner/${item.image}`
      }
  }) : [] 
  const videoInicial = await getVideoInitial()
   const rifa = await getRifa()
   
  return res.status(200).json({
    error: false,
    response: {
      imagesBanner: updateRoutesBanner,
      videoInicialUrl: !(videoInicial.error) ? videoInicial.response[0].url : '',
      infoVideoInial: {
        title: "Mira como puedes tener mas oportunidad de ganar",
        description:
          "Una pequeña descripcion sobre como hacer dinero con nosotros y poder salir adelante en cualquier meta que te propongas en la vida, luchando y trabajando en lo que te apasiona",
      },
      horaRifa: rifa.error ? '' : (rifa.response[0]?.hora || ''),
      fechaRifa: rifa.error ? '' : (rifa.response[0]?.fecha || ''),
      rifaId: rifa.error ? '' : (rifa.response[0]?.id || null),
      participandoSorteo: 1340,
      rifaStatus: rifa.status,
      lastWinners: [
        {
          id: "1",
          title: "Sorteo",
          fecha: "14/09/2024",
          name: "Mauricio Moreno",
          ci: "23777790",
          direccion: "Valera",
          numeroGanador: "28",
          videoUrl: "https://www.youtube.com/watch?v=xKt5kj8Y5OI"
        },

        {
          id: "2",
          title: "Rifa",
          fecha: "15/09/2024",
          name: "Hector Salas",
          ci: "26877841",
          direccion: "Valera",
          numeroGanador: "2485",
          videoUrl:''
        }
      ],

      Faqs: [
        {
          title: "¿Cómo funcionan las Rifas? ",
          response:
            'Solo tienes que entrar al apartado de "RIFAS" y elegir los numeros con los cuales desees participar, al cumplirse el tiempo establecido, en nuestra plataforma, canales de difunsión como youtube, spotify y nuetras redes sociales se transmitira totalmente en vivo el proceso para elegir el ganador y a su vez se estará dando a conocer dicho ganador, además algunos datos del ganador estaran visibles en nuestra plataforma para hacer valer nuestra integridad y transprencia',
        },
        {
          title: "¿Cómo funcionan los sorteos diarios?",
          response:
            'Al igual que las rifas solo tienes que entrar al apartado "SORTEOS" y elegir los numeros con los cuales desees participar, estos sorteos se realizarán diariamente a las 6pm hora de Venezuela. Se debe tomar en cuenta que la participacion minima para realizar el sorteo es de 100 personas asi podemos decir que el premio minimo diario es de 100$, si la cantidad de participantes es de 500 personas o mas pero no llegan a 1000 el premio minimo es de 500$, si llegamos a 1000 personas o mas el premio maximo es de 1000$. En el caso de no llegar a un minimo de participantes(100), el sorteo se realizara al dia siguiente. Al llegar la hora establecida y cumplir con la participacion minima, en nuestra plataforma, canales de difunsión como youtube, spotify y nuetras redes sociales se transmitira totalmente en vivo el proceso para elegir el ganador y a su vez se estará dando a conocer dicho ganador, además los datos del ganador estaran visibles en nuestra plataforma para hacer valer nuestra integridad y transprencia',
        },
        {
          title: "¿Cómo se obtiene una mayor ventaja para ganar?",
          response:
            "Al hacer tu compra bien sea de un solo numero o varios en la misma compra se te regala un id unico, el cual es un link para que puedas comprartirlo en tus diferentes redes socioales o metodo que prefieras. Por cada 10 personas que entren a nuestra plataforma a través de ese link y hagan una compra recibiras un numero aleatorio disponible. IMAGINATE EL PROVECHO QUE SE LE PUEDE SACAR A ESTO ☻",
        },
        {
          title: "¿Que metodos de pago se aceptan?",
          response:
            "Tratamos de que el proceso de pago sea lo más rapido y eficiente posible para la comodidad de nuestros usuarios. La confianza del consumidor es un elemento clave a la hora de finalizar una compra en el comercio electrónico. Muchos son los métodos que se han intentado implementar en cuanto al pago en las transacciones. A continuación, se detallan algunos de los medios más utilizados: Paypal, Zelle, Tarjeta bancaria, Transferencias bancarias, Pago a través del móvil y Moneda virtual",
        },
        {
          title: "¿Como se notifica a los ganadores?",
          response:
            "Después de realizar una compra verificada independientemente del evento en que el usuario deseé participar se estará llevando a un apartado para que introduzca sus datos en un formulario y así tener como contactarnos, además solo algunos de estos datos estaran visibles en nuestra plataforma, para hacer valer nuestra integridad, transparencia y confianza",
        },
        {
          title: "¿Como es la entrega de los premios?",
          response:
            "En el caso de la entrega de los premios de las rifas, ponernos en contacto con nuestros ganadores es una gran ventaja, ya que existe la posibilidad de una interaccion personal, nuestros ganadores podrian elegir el medio que mas les convengan. En el caso de los sorteos el premio se estará entregando por el mismo medio de pago que el usuario realizá su compra",
        },
      ],
    },
  });
};

const saveImage = (file) => {
  let cleanName = file.originalname.replace(" ", "-");
  const newPath = `./public/banner/${cleanName}`;
  fs.renameSync(file.path, newPath);
  return {
    nameImage: cleanName,
  };
};

export const addVideoInitial = async (req, res) => {
  const { url } = req.body;
  try {
    const [query] = await pool.query("SELECT * FROM video_inicio");
    if (query.length === 0) {
      const [result] = await pool.query(
        "INSERT INTO video_inicio (url) VALUES (?) ",
        [url]
      );
        if (result.affectedRows > 0) {
          res.status(200).json({
            error: false,
            response: "video Agregado correctamente",
          });
        } else {
          res.status(200).json({
            error: true,
            response: "El video no pudo ser Agregado",
          });
        }
    } else {
      const id = Number(query[0].id);
      const [result] = await pool.query(
        "UPDATE video_inicio SET url = ? WHERE id = ? ",
        [url, id]
      );
        if (result.affectedRows > 0) {
          res.status(200).json({
            error: false,
            response: "video Actualizado correctamente",
          });
        } else {
          res.status(200).json({
            error: true,
            response: "El video no pudo ser Actualizado",
          });
        }
    }
  } catch (error) {
      return res.status(500).json({
        error: true,
        response:
          "La ruta solicitada no esta disponible temporalmente debido a un error inesperado",
      });
  }
};

export const getVideoInitial = async (req, res) => {
  try {
    const [query] = await pool.query("SELECT * FROM video_inicio");
    if (!req && !res) return { error: false, response: query}
      res.status(200).json({
        error: false,
        response: query,
      });
  } catch (error) {
    if (!req && !res) return { error: false, response: "La ruta solicitada no esta disponible temporalmente debido a un error inesperado"}
      return res.status(500).json({
        error: true,
        response:
          "La ruta solicitada no esta disponible temporalmente debido a un error inesperado",
      });
  }
};

export const getBannerInicio = async (req, res) => {

  try {
    const [query] = await pool.query("SELECT * FROM banner_inicio");
    if (!req && !res) return {
      error: false,
      response: query,
    }
      
    res.status(200).json({
      error: false,
      response: query,
    });
  
  } catch (error) {
     if(!req && !res) return {
      error: true,
      response:
        "La ruta solicitada no esta disponible temporalmente debido a un error inesperado",
    }
      return res.status(500).json({
        error: true,
        response:
          "La ruta solicitada no esta disponible temporalmente debido a un error inesperado",
      });
  }
};

export const editImageBanner = async (req, res) => {
  try {
        const { id } = req.body
        const { nameImage } = saveImage(req.file);
        const [result] = await pool.query(
          "UPDATE banner_inicio SET image = ? WHERE id = ? ",
          [nameImage,id]
        );
        if (result.affectedRows > 0) {
            return res.status(200).json({
               error: false,
               response: "se actualizo correctamente la imagen",
             });
        } else {
            return res.status(200).json({
               error: true,
               response: "No se pudo Actualizar la imagen",
             });
        }
  } catch (error) {
      return res.status(500).json({
        error: true,
        response:
          "La ruta solicitada no esta disponible temporalmente debido a un error inesperado",
      });
  }
};

export const addMultiBanner = async (req,res) => {
  const  banner  = req.files;
  const adds = [];
  const noAdds = [];
  try {
    for (const imagen of banner) {
       
      const { nameImage } = saveImage(imagen);
      const [result] = await pool.query(
        "INSERT INTO banner_inicio (image) VALUES (?) ",
        [nameImage]
      );
      if (result.affectedRows > 0) {
        adds.push(nameImage);
      } else {
        noAdds.push(nameImage);
      }
    } 
    if (adds.length === 0) {
       return res.status(200).json({
          error: true,
          response: "No se pudo Agregar ninguna imagen",
        });
    } 

    if (adds.length > 0 && noAdds.length === 0) {
         return res.status(200).json({
            error: false,
            response: "se subieron correctamente todas las imagenes",
          });
      } 

      if (adds.length > 0 && noAdds.length > 0) {
         return res.status(200).json({
            error: false,
            response: `se subieron correctamente (${adds.length}) imagenes : ${adds} pero no se cargaron
             (${noAdds.length}) imagenes: ${noAdds} `,
          });
      }
  } catch (error) {
   
      return res.status(500).json({
        error: true,
        response:
          "La ruta solicitada no esta disponible temporalmente debido a un error inesperado",
      });
  }
}

export const addSingleBanner = async (req,res) => {
  try {
    const { nameImage } = saveImage(req.file);
    const [result] = await pool.query(
      "INSERT INTO banner_inicio (image) VALUES (?) ",
      [nameImage]
    );
    if (result.affectedRows > 0) {
        return res.status(200).json({
           error: false,
           response: "se Agrego una nueva Imagen correctamente la imagen",
         });
    } else {
        return res.status(200).json({
           error: true,
           response: "No se pudo Agregar la imagen",
         });
    }
} catch (error) {

  return res.status(500).json({
    error: true,
    response:
      "La ruta solicitada no esta disponible temporalmente debido a un error inesperado",
  });
}
  
}

export const replaceAllBaner = async (req,res) => {
  const  banner  = req.files;
  const adds = [];
  const noAdds = [];
  try {
    const [query] = await pool.query("DELETE FROM banner_inicio");
    if (query.affectedRows > 0) {
      for (const imagen of banner) {
      const { nameImage } = saveImage(imagen);
      const [result] = await pool.query(
        "INSERT INTO banner_inicio (image) VALUES (?) ",
        [nameImage]
      );
      if (result.affectedRows > 0) {
        adds.push(nameImage);
      } else {
        noAdds.push(nameImage);
      }
    } 
    if (adds.length === 0) {
       return res.status(200).json({
          error: true,
          response: "No se pudo Agregar ninguna imagen",
        });
    } 

    if (adds.length > 0 && noAdds.length === 0) {
         return res.status(200).json({
            error: false,
            response: "se subieron Remplazaron correctamente todas las imagenes",
          });
      } 

      if (adds.length > 0 && noAdds.length > 0) {
         return res.status(200).json({
            error: false,
            response: `se subieron correctamente (${adds.length}) imagenes : ${adds} pero no se cargaron
             (${noAdds.length}) imagenes: ${noAdds} `,
          });
      }
     
    } else {
        return res.status(200).json({
           error: true,
           response: "No se pudo Remplazar ninguna imagen",
         });
    }

  
  } catch (error) {
      return res.status(500).json({
        error: true,
        response:
          "La ruta solicitada no esta disponible temporalmente debido a un error inesperado",
      });
  }
}

export const deleteImageBanner = async (req,res) => {
  try {
    const { id } = req.body
    const [result] = await pool.query(
      "DELETE FROM banner_inicio WHERE id = ? ",
      [id]
    );
    if (result.affectedRows > 0) {
        return res.status(200).json({
           error: false,
           response: "se elimino correctamente la imagen",
         });
      
    } else {
    
        return res.status(200).json({
           error: true,
           response: "No se pudo eliminar la imagen",
         });
       
    }
} catch (error) {
  return res.status(500).json({
    error: true,
    response:
      "La ruta solicitada no esta disponible temporalmente debido a un error inesperado",
  });

}
}

export const getNumberBuyers = async (req, res) => {
   try {
    const [query] = await pool.query("SELECT COUNT(*) AS total FROM buyers_sorteo");
    return res.status(200).json({
      error:false,
      response:query[0]
    })
   } catch (error) {
    return res.status(500).json({
      error: true,
      response:
        "La ruta solicitada no esta disponible temporalmente debido a un error inesperado",
    });
   }
}