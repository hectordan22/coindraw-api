// importo modulo de MySql
import { createPool } from "mysql2/promise";

// importo las variables de entorno para la conexion a la BD

import {DB_HOST,DB_USER,DB_PASSWORD, DB_NAME,DB_PORT} from './config.js'
 

// importo la conexion a la base de datos para que la use index.js
export const pool = createPool({
    host:DB_HOST,
    user:DB_USER,
    password:DB_PASSWORD,
    database:DB_NAME,
    port:DB_PORT

})
