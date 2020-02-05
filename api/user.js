const bcrypt = require('bcrypt-nodejs')

module.exports = app => {
    const { existOrError, notExistOrError, equalsOrError} = app.api.validacao
    const encryptPasssword = password => {
        const salt = bcrypt.genSaltSync(10)
        return bcrypt.hashSync(password, salt)

    }
    const save =  async (req,res) => {
        const user = {...req.body}
        if(req.params.id) {
            user.id = req.params.id // setando o id do user com o id passado no parametro da url
                                        // se ele for passado para dar update
        }
        try {
            // validações do dados passados no body
            existOrError(user.name, 'Name not found')
            existOrError(user.email, 'Email not found')
            existOrError(user.password, 'Senha not found')
            existOrError(user.confirmPassword, 'Confirm your password')
            equalsOrError(user.password, user.confirmPassword, "Passowrd dont match")
            const userFromDB =  await app.db('users') // acesando a tablea users do postgres
                .where({email: user.email}).first()
                if(!user.id) {
                    notExistOrError(userFromDB, 'User already registered') // Não entendi mt bem mas basicamente, ele valida se o usuario ja existe em banco
                }

        } catch(msg){
                return res.status(400).send(msg)
        }
        user.password = encryptPasssword(user.password) // encripta a senha
        delete user.confirmPassword

        if(user.id){ // se existir ja no bd um id 
            app.db('users')
            .update(user)
            .where({id:user.id})
            .then(() => res.status(204).send())
            .catch( err=> res.status(500).send(err))
        } else {
            app.db('users')
            .insert(user)
            .then(()=> res.status(200).send("Usuário Criado"))
            .catch(err=> res.status(500).send(err))
        }
    }
     // Método pra listar todos os usuários do sistema.
    const get = (req,res) => {
            app.db('users')
            .select('id', 'name', 'email', 'admin')
            .then(users=> res.json(users))
            .catch(err=> res.status(500).send(err))
    }
    // método pra listar user por ID
    const getById = (req,res) => {
        app.db('users')
        .select('id', 'name','email', 'admin')
        .where({id: req.params.id})
        .first()
        .then(user => res.json(user))
        .catch(err=> res.status(500).send(err))
    }
    return { save, get, getById  }
}