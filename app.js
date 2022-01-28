
require('babel-register');
const {checkAndChange} = require('./assets/functions');
const mysql = require('promise-mysql');
const bodyParser = require('body-parser');
const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./assets/swagger.json')
const morgan = require('morgan')('dev');
const config = require('./assets/config');
const { json } = require('body-parser');


mysql.createConnection({
    host: config.db.host,
    database: config.db.database,
    user: config.db.user,
    password: config.db.password
})
.then((db)=>{

    console.log('Connected.')

    const app = express()

    let MembersRouter = express.Router()

    let Members = require('./assets/classes/members-class')(db,config)
    
    app.use(morgan);
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(config.rootAPI + 'api-docs',swaggerUi.serve,swaggerUi.setup(swaggerDocument));
    
    MembersRouter.route('/:id')

        // Récupère un membre avec son ID
        .get(async (req, res) => {
            let member = await Members.getMemberById(req.params.id);
            res.json(checkAndChange(member));
        })

        // Modifie un membre avec ID
        .put(async (req, res) => {
            let update = await Members.updateMemberById(req.params.id, req.body.name);
            res.json(checkAndChange(update));
            

        })

        // Supprime un membre avec ID
        .delete(async (req,res)=>{
            let deleteM = await Members.deleteMember(req.params.id)
            res.json(checkAndChange(deleteM))
        })

    MembersRouter.route('/')

        // Récupère tous les membres
        .get(async (req, res) => {
            let allMember = await Members.getAllMembers(req.query.max);
            res.json(checkAndChange(allMember));
        })

        // Ajoute un membre avec son nom
        .post(async (req, res) => {
            let add = await Members.addMember(req.body.name);
            res.json(checkAndChange(add));
        })

    app.use(config.rootAPI+'members', MembersRouter)

    app.listen(config.port, () => console.log('Started on port '+config.port))
})

.catch((err)=>{
    console.log("Error during db connection");
    console.log(err.message);
})