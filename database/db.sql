create database fuerzaactiva ; 

use fuerzaactiva ;

    create table inicio (
        id int PRIMARY KEY auto_increment NOT NULL,
        nombre_usuario varchar (100) not null,
        contrasena varchar (200) unique  not null,
        nombre_completo varchar (100) not null);	

-- agregar esta columna para la recuperacion de contraseña. 
    ALTER TABLE inicio
    add COLUMN correo VARCHAR(100) NOT NULL;
    ALTER TABLE inicio
MODIFY COLUMN correo VARCHAR(100) UNIQUE NOT NULL;

ALTER TABLE inicio
drop COLUMN correo;

    ALTER TABLE inicio
ADD COLUMN reset_password_token VARCHAR(255) NULL,
ADD COLUMN reset_password_expires BIGINT NULL;
--reset_password_token: Almacenará el token único generado para el restablecimiento.
--reset_password_expires: Almacenará la fecha y hora de expiración del token como... 
--un timestamp (número de milisegundos desde la época Unix). Esto es para que el token no sea válido para siempre.

    -- esto es para hashear la contraseña de wilmer admin 
    INSERT INTO inicio (nombre_usuario, contrasena, nombre_completo, correo, rol)
    VALUES ('wilmeradmin', 'wilmeradmin', 'Wilmer Administrador', 'pzeus2987@gmail.com', 'Admin');

    UPDATE inicio
    SET contrasena = '$2b$10$D3AGUDp2shl6/5VN8nWj8uoML87KGfr0J3I.6M5eW1q7rjMFNOTZS'
    WHERE id = 2; WHERE nombre_usuario = 'wilmeradmin';

    ALTER TABLE inicio
    DROP COLUMN fecha; --se borro la columna fecha de la tabla inicio
    describe inicio;  -- este es para ver la tabla
    ALTER TABLE inicio
    DROP COLUMN nombre_completo;
    alter table inicio
    add nombre_completo varchar (40) not null;
    ALTER TABLE inicio
    DROP INDEX contrasena; -- En MySQL, UNIQUE se implementa con un índice.
    -- Añadir la columna 'rol' para diferenciar administradores de clientes
    ALTER TABLE inicio
    ADD COLUMN rol ENUM('Cliente', 'Admin') NOT NULL DEFAULT 'Cliente' AFTER nombre_completo;

    describe inicio; -- los cambios han sido modificado, la comtraseña ya no es unique y se agrego el rol. 


    -- base de datos de fuerza activa modificado

    CREATE TABLE Clientes (
        id INT PRIMARY KEY  AUTO_INCREMENT Not NULL, 
        inicio_id int (11),
        tipo_cliente VARCHAR (150) NOT NULL,
        nombre_contacto VARCHAR(150) NOT NULL,    
        nombre_empresa VARCHAR(150),              
        cedula_rif VARCHAR(20) UNIQUE,            
        email_contacto VARCHAR(100) UNIQUE NOT NULL, 
        telefono_contacto VARCHAR(20),            
        direccion_principal VARCHAR(255),         
        origen_cliente VARCHAR(100),
        descripcion TEXT,               
        fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        constraint FK_inicio FOREIGN KEY (inicio_id) REFERENCES inicio (id)
        );

   -- agregar columna para identificar el numero de registro de cada usuario 
    ALTER TABLE clientes
    ADD COLUMN numero_registro varchar (40) not null;
    ALTER TABLE clientes
    DROP COLUMN numero_registro;
    ---

    -- Tabla: Solicitudes_Servicio
    -- Registra cada solicitud de servicio que un cliente realiza.
    CREATE TABLE Servicios (
        id INT PRIMARY KEY  AUTO_INCREMENT NOT NULL, 
        cliente_id INT (11),                  
        tipo_servicio VARCHAR(100) NOT NULL,      
        fecha_solicitud TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
        fecha_requerida DATE NOT NULL,            
        numero_oficiales_requeridos INT,          
        duracion_estimada_horas VARCHAR(100),    
        direccion_servicio VARCHAR(255) NOT NULL, 
        detalles_adicionales TEXT,   
        descripcion TEXT,             
        constraint FK_cliente FOREIGN KEY (cliente_id) REFERENCES Clientes(id));

-- agregar columna para que inicio pudiera pegar con la tabla inicio, la ruta se llama auth
ALTER TABLE Servicios
ADD COLUMN inicio_id int (11);

-- agregar columna para que inicio pudiera pegar con la tabla inicio, la ruta se llama auth
alter table Servicios
add COLUMN constraint FK_inicio FOREIGN KEY (inicio_id) REFERENCES inicio(id));

 
-- agregar columna para identificar el numero de registro de solicitud de cada usuario 
ALTER TABLE Servicios
ADD COLUMN numero_registro varchar (40) not null;
ALTER TABLE Servicios
DROP COLUMN numero_registro;

-- agregar columna para agregar edad de los oficiales requeridos
ALTER TABLE Servicios
ADD COLUMN edad_oficiales_requeridos varchar (150);

-- agragar columna para agregar nombre de la persona que realiza la solictud, para comprar con el registro del cliente
ALTER TABLE Servicios
ADD COLUMN nombre_cliente varchar (80) not null;

ALTER TABLE servicios
DROP COLUMN nombre_cliente;

-- mordifique la tabla de numero O.R para que se coloque el sexo tambien antes era int ahora es varchar
ALTER TABLE Servicios
MODIFY COLUMN numero_oficiales_requeridos VARCHAR(150);


--implementar on delete para que cuando se borre un cliente en la oarte administradar, 
--tambien se borren todas las solicitudes, es para que no haya problemas por las llaves foraneas. 

ALTER TABLE servicios
ADD CONSTRAINT fk_servicios_clientes
FOREIGN KEY (cliente_id)
REFERENCES clientes(id)
ON DELETE CASCADE;

--Si tienes ON DELETE CASCADE configurado en la clave foránea servicios.cliente_id que referencia a clientes.id: 
--Cuando elimines un cliente, automáticamente se eliminarán todos los servicios relacionados con ese cliente. 
--¡Esto es lo ideal y lo más sencillo de gestionar!
--Si NO tienes ON DELETE CASCADE: Si intentas eliminar un cliente que tiene servicios asociados, 
--tu base de datos MySQL te dará un error de clave foránea (Cannot delete or update a parent row: a foreign key constraint fails). 
--Para evitar esto, tendrías que eliminar manualmente todos los servicios relacionados ANTES de eliminar el cliente.

-- despuesa de tantas modificaciones mis tablas quedaron asi: 
CREATE TABLE inicio (
  id int primary key  AUTO_INCREMENT NOT NULL,
  nombre_usuario varchar(100) NOT NULL,
  contrasena varchar(200) NOT NULL,
  nombre_completo varchar(100) NOT NULL,
  rol enum('Cliente','Admin') NOT NULL DEFAULT 'Cliente',
  reset_password_token varchar(255) DEFAULT NULL,
  reset_password_expires bigint DEFAULT NULL,
  correo varchar(100) NOT NULL);

  CREATE TABLE clientes (
  id int primary key  AUTO_INCREMENT NOT NULL,
  inicio_id int DEFAULT NULL,
  tipo_cliente varchar(150) NOT NULL,
  nombre_contacto varchar(150) NOT NULL,
  nombre_empresa varchar(150) DEFAULT NULL,
  cedula_rif varchar (20) unique DEFAULT NULL,
  email_contacto varchar (100) NOT NULL,
  telefono_contacto varchar(20) DEFAULT NULL,
  direccion_principal varchar(255) DEFAULT NULL,
  origen_cliente varchar(100) DEFAULT NULL,
  descripcion text,
  fecha_registro timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  numero_registro varchar(40) NOT NULL,
  CONSTRAINT FK_inicio FOREIGN KEY (inicio_id) REFERENCES inicio (id));

  CREATE TABLE servicios (
  id int primary key AUTO_INCREMENT NOT NULL,
  cliente_id int DEFAULT NULL,
  tipo_servicio varchar(100) NOT NULL,
  fecha_solicitud timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_requerida date NOT NULL,
  numero_oficiales_requeridos varchar(150) DEFAULT NULL,
  duracion_estimada_horas varchar(100) DEFAULT NULL,
  direccion_servicio varchar(255) NOT NULL,
  detalles_adicionales text,
  descripcion text,
  inicio_id int DEFAULT NULL,
  edad_oficiales_requeridos varchar(150) DEFAULT NULL,
  nombre_cliente varchar(80) NOT NULL,
  numero_registro varchar(40) NOT NULL,
  CONSTRAINT fk_servicios_clientes FOREIGN KEY (cliente_id) REFERENCES clientes (id) ON DELETE CASCADE);
