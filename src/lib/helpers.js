const bcrypt = require ('bcryptjs');

const helpers = {};

helpers.encryptPassword = async (contrasena) => {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(contrasena, salt);
    return hash;
};

helpers.matchPassword = async(contrasena, savedPassword) =>{
    try {
        return await bcrypt.compare(contrasena, savedPassword);
    } catch (e) {
        console.error('Error al comparar contraseña en helpers:', e); 
        return false;
    }
}

// este es pra hashear contraseñas 
//async function hashAdminPassword() {
    //const salt = await bcrypt.genSalt(10);
   // const hashedPassword = await bcrypt.hash('Wilmeradmin', salt);
    //console.log('Contraseña Hasheada para Wilmeradmin:', hashedPassword);
//}
    //hashAdminPassword();

    module.exports = helpers;