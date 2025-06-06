const mysql = require ('mysql2'); // ¡Correcto, estamos usando mysql2!
const {promisify} = require ('util');

const {database} = require('./keys') // Esto importa tu objeto { host: '...', user: '...', etc. }



const pool = mysql.createPool (database);

pool.getConnection((err, connection) => {
    if (err) {
        if (err.code === 'PROTOCOL_CONNECTION_LOST'){
            console.error('DATABASE CONNECTION DATABASE WAS CLOSED ');
        } else if (err.code === 'ER_CON_COUNT_ERROR') {
            console.error ('DATABASE HAS TOO MANY CONNECTIONS');
        } else if (err.code === 'ECONNREFUSED'){
            console.error ('DATABASE CONNECTION WAS REFUSED');
        } else if (err.code === 'ER_NOT_SUPPORTED_AUTH_MODE'){
            // Este error ya no debería aparecer si mysql2 y el usuario están bien.
            console.error('AUTHENTICATION ERROR (mysql2): Client does not support authentication protocol.', err.sqlMessage);
        }
        else {
            console.error('An unknown database connection error occurred:', err);
        }
        return;
    }

    if (connection) {
        connection.release();
    }
    console.log ('DB is Connected');
    return;
});

pool.query = promisify(pool.query)

module.exports = pool;