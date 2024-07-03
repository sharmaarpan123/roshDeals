
import bcrypt from 'bcrypt'
const creatingHashPassword = async  (password) => {

    const salt = await bcrypt.genSalt();
    return await bcrypt.hash(password , salt)


}


const  comparePassword = async  (password , hashPassword) => {

    return await bcrypt.compare(password  , hashPassword)

}

export {creatingHashPassword , comparePassword}