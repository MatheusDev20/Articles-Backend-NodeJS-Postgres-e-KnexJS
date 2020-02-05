const {authSecret} = require('../../env_file');
const jwt = require('jwt-simple');
const bCrypt = require('bcrypt-nodejs');

module.exports = app => {
    const signIn = async (req,res) => {
        if(!req.body.email || !req.body.password) {
            return res.status(400).send('Informe usuario e senha ')
        }
        const user = await app.db('users')
        .where({email:req.body.email})
        .first()

        if(!user) {
            return res.status(400).send('User not registered')
        }
        const isMatch = bCrypt.compareSync(req.body.password, user.passowrd)
        if(!isMatch) {
            return res.status(401).send('Invalid Email/Senha')
        }
        const now = Math.floor(Date.now() / 1000) // arredondando.

        const payLoad = {  // Conteudo do Token
            id: user.id,
            name:user.name,
            admin: user.admin,
            iat: now,
            exp: now + (60 * 60 *24)
        }

        res.json({
            ...payload,
            token: jwt.encode(payload, authSecret)
        })
    }

    const validateToken = async (req, res) => {
        const userData = req.body || null
        try {
            if(userData) {
                const token = jwt.decode(userData.token, authSecret)
                if(new Date(token.exp * 1000) > new Date()) {
                    return res.send(true)
                }
            }
        } catch(e) {
            // problema com o token
        }

        res.send(false)
    }

    return { signin, validateToken }
}