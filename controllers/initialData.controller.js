import { pool } from '../db.js'

export const initialData = (req,res) => {
    return res.status(200).json({
        error: false,
        response: {
            imagesBanner:[
                 'https://dadco.me/wp-content/uploads/2021/03/navidad-1.jpg',
                 'https://farmaciaslarebaja.cl/wp-content/uploads/2023/11/Sorteo-Hyundai-Gran-i10-FLR-1.jpg',
                 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQZZJJFdGHl6RNyCsMHdkodsL4pf18Mi6n5mg&s',
                 'https://www.druni.es/blog/wp-content/uploads/2024/08/banner_portada_blog_sorteo_CANARIAS-380x280.jpg'
            ],
            videoInicialUrl:'https://www.youtube.com/watch?v=Yx1gLjqZV5g',
            infoVideoInial:{
                title: 'Mira como puedes tener mas oportunidad de ganar',
                description:'Una pequeña descripcion sobre como hacer dinero con nosotros y poder salir adelante en cualquier meta que te propongas en la vida, luchando y trabajando en lo que te apasiona'
            },
             horaRifa:'12:00',
             fechaRifa:'12/10/2024',
             participandoSorteo:203,
             rifaActiva:true,
             lastWinners:[
                {
                    id: "1",
                    title: 'Sorteo',
                    fecha: '14/09/2024',
                    name: 'Mauricio Moreno',
                    ci: '23777790',
                    direccion: 'Valera',
                    numeroGanador: '28',
                    videoUrl: ''
                    },
                  
                   {
                    id: "2",
                    title: 'Rifa',
                    fecha: '15/09/2024',
                    name: 'Hector Salas',
                    ci: '26877841',
                    direccion: 'Valera',
                    numeroGanador: '2485',
                    videoUrl: 'https://www.youtube.com/watch?v=xKt5kj8Y5OI'
                  } 
             ],
            
              Faqs: [
                {
                    title: '¿Cómo funcionan las Rifas? ',
                    response: 'Solo tienes que entrar al apartado de "RIFAS" y elegir los numeros con los cuales desees participar, al cumplirse el tiempo establecido, en nuestra plataforma, canales de difunsión como youtube, spotify y nuetras redes sociales se transmitira totalmente en vivo el proceso para elegir el ganador y a su vez se estará dando a conocer dicho ganador, además algunos datos del ganador estaran visibles en nuestra plataforma para hacer valer nuestra integridad y transprencia'
                },
                {
                    title: '¿Cómo funcionan los sorteos diarios?',
                    response: 'Al igual que las rifas solo tienes que entrar al apartado "SORTEOS" y elegir los numeros con los cuales desees participar, estos sorteos se realizarán diariamente a las 6pm hora de Venezuela. Se debe tomar en cuenta que la participacion minima para realizar el sorteo es de 100 personas asi podemos decir que el premio minimo diario es de 100$, si la cantidad de participantes es de 500 personas o mas pero no llegan a 1000 el premio minimo es de 500$, si llegamos a 1000 personas o mas el premio maximo es de 1000$. En el caso de no llegar a un minimo de participantes(100), el sorteo se realizara al dia siguiente. Al llegar la hora establecida y cumplir con la participacion minima, en nuestra plataforma, canales de difunsión como youtube, spotify y nuetras redes sociales se transmitira totalmente en vivo el proceso para elegir el ganador y a su vez se estará dando a conocer dicho ganador, además los datos del ganador estaran visibles en nuestra plataforma para hacer valer nuestra integridad y transprencia'
                },
                {
                    title: '¿Cómo se obtiene una mayor ventaja para ganar?',
                    response: 'Al hacer tu compra bien sea de un solo numero o varios en la misma compra se te regala un id unico, el cual es un link para que puedas comprartirlo en tus diferentes redes socioales o metodo que prefieras. Por cada 10 personas que entren a nuestra plataforma a través de ese link y hagan una compra recibiras un numero aleatorio disponible. IMAGINATE EL PROVECHO QUE SE LE PUEDE SACAR A ESTO ☻'
                },
                {
                    title: '¿Que metodos de pago se aceptan?',
                    response: 'Tratamos de que el proceso de pago sea lo más rapido y eficiente posible para la comodidad de nuestros usuarios. La confianza del consumidor es un elemento clave a la hora de finalizar una compra en el comercio electrónico. Muchos son los métodos que se han intentado implementar en cuanto al pago en las transacciones. A continuación, se detallan algunos de los medios más utilizados: Paypal, Zelle, Tarjeta bancaria, Transferencias bancarias, Pago a través del móvil y Moneda virtual'
                },
                {
                    title: '¿Como se notifica a los ganadores?',
                    response: 'Después de realizar una compra verificada independientemente del evento en que el usuario deseé participar se estará llevando a un apartado para que introduzca sus datos en un formulario y así tener como contactarnos, además solo algunos de estos datos estaran visibles en nuestra plataforma, para hacer valer nuestra integridad, transparencia y confianza'
                },
                {
                    title: '¿Como es la entrega de los premios?',
                    response: 'En el caso de la entrega de los premios de las rifas, ponernos en contacto con nuestros ganadores es una gran ventaja, ya que existe la posibilidad de una interaccion personal, nuestros ganadores podrian elegir el medio que mas les convengan. En el caso de los sorteos el premio se estará entregando por el mismo medio de pago que el usuario realizá su compra'
                }
            ]


        }
    })
}

export const addVideoInitial = async (req,res) => {
   const {url} = req.body
   try {
       const [query] = await pool.query('SELECT * FROM video_inicio')
       if (query.length === 0) {
           const [result] = await pool.query('INSERT INTO video_inicio (url) VALUES (?) ', [url]);
        setTimeout(() => {
            if (result.affectedRows > 0) {
                res.status(200).json({
                  error:false,
                  response:'video Agregado correctamente'
                })
              } else {
                  res.status(200).json({
                      error:true,
                      response:'El video no pudo ser Agregado'
                  })
              }
        }, 3000);
         
        }else{
           const id = Number(query[0].id)
           const [result] = await pool.query('UPDATE video_inicio SET url = ? WHERE id = ? ', [url,id]);
          setTimeout(() => {
            if (result.affectedRows > 0) {
                res.status(200).json({
                  error:false,
                  response:'video Actualizado correctamente'
                })
              } else {
                  res.status(200).json({
                      error:true,
                      response:'El video no pudo ser Actualizado'
                  })
              }
          }, 3000);
           
        }
   } catch (error) {
    setTimeout(() => {
        return res.status(500).json({
            error: true,
            response: 'La ruta solicitada no esta disponible temporalmente debido a un error inesperado'
        })
    }, 3000);
   
   }
} 

export const getVideoInitial = async (req,res) => {
   try {
    const [query] = await pool.query('SELECT * FROM video_inicio')
     setTimeout(() => {
        res.status(200).json({
            error:false,
            response: query
         })
     }, 3000);
      
   } catch (error) {
    setTimeout(() => {
        return res.status(500).json({
            error: true,
            response: 'La ruta solicitada no esta disponible temporalmente debido a un error inesperado'
        })
    }, 3000);
   }
}