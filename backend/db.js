import { createPool } from 'mysql2/promise';
import 'dotenv/config';

/* createPool: crea un pool de conexiones a MySQL que permite manejar múltiples conexiones de forma eficiente.
'dotenv/config': carga automáticamente las variables de entorno desde un archivo .env para acceder a credenciales sin exponerlas en el código.
 */

//conexion a la base de datos
const pool = createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});


/* 

- waitForConnections: true: si todas las conexiones están ocupadas, espera a que una se libere.
- connectionLimit: 10: máximo de 10 conexiones simultáneas.
- queueLimit: 0: sin límite en la cola de espera para nuevas conexiones.

*/

//función para probar la conexión
export const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('Conexión exitosa a la base de datos');
    connection.release();
  } catch (error) {
    console.error('Error al conectar a la base de datos:', error);
   }
};

export default pool;


/*

- Usa await pool.getConnection() para obtener una conexión del pool.
- Si se conecta correctamente, imprime un mensaje de éxito.
- Libera la conexión con connection.release() para que pueda ser reutilizada.
- Si falla, captura el error y lo muestra en consola.

 */