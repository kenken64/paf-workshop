// 1. import all the node modules
const express = require('express'),
      bodyParser = require('body-parser'),
      secureEnv = require('secure-env'),
      cors = require('cors'),
      mysql = require('mysql2/promise');
// 2. construct new express object
const app = express();

// 3. Initialize all the relevant params for the
// express middleware
app.use(cors());
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(bodyParser.json({limit: '50mb'}));

// 4. intgrate with secure env
global.env = secureEnv({secret: 'isasecret'});

// 5. get port env variable value from secure env
const APP_PORT = global.env.APP_PORT;

// 6. Create Mysql connection Pool
// Require to pass in all the database credentials
// setup parameters
const pool = mysql.createPool({
    host: global.env.MYSQL_SERVER,
    port: global.env.MYSQL_SVR_PORT,
    user: global.env.MYSQL_USERNAME,
    password: global.env.MYSQL_PASSWORD,
    database: global.env.MYSQL_SCHEMA,
    connectionLimit: global.env.MYSQL_CON_LIMIT
});

// 7. Construct SQL -  select all statement and insert one record
const queryAllRsvp = `SELECT id, name, email, phone, status, createdBy, 
    createdDt, updatedBy, updatedDt from rsvp`;
const insertRsvp = `INSERT INTO 
    rsvp (name, email, phone, status, createdBy, createdDt) 
    values (?,?,?,?,?,CURDATE())`;

// 8. Establish connection , take in params and query the rdbsm 
// rsvp table 
const makeQuery = (sql, pool)=>{
    console.log(sql);
    return (async (args) =>{
        const conn = await pool.getConnection();
        try{
            let results = await conn.query(sql, args || []);
            console.log(results);
            return results[0];
        }catch(err){
            console.log(err);
        }finally{
            conn.release();
        } 
    });
};

// 9. Create the closure function for the end point to
// perform crud operation against the database
const findAllRsvp = makeQuery(queryAllRsvp, pool);
const saveOneRsvp = makeQuery(insertRsvp, pool);

const COMMON_NAMESPACE = "/api";


// 10. end point that return all rsvp
// invoke the findAllRsvp closure function 
app.get(`${COMMON_NAMESPACE}/rsvps`, (req, res)=>{
    console.log('get all rsvp');
    findAllRsvp([]).then((results)=>{
        res.status(200).json(results);
    }).catch((err)=>{
        console.log(err)
        res.status(500).json(err);
    });
    
});

// 11. end point that insert one record to the rsvp table
// capture the values from the http request object
// invoke the saveOneRsvp closure function 
app.post(`${COMMON_NAMESPACE}/rsvp`, (req, res)=>{
    console.log(req.body);
    saveOneRsvp([req.body.name, req.body.email, 
        req.body.phone, req.body.status, 1])
    .then((result)=>{
        res.status(200).json(result);
    }).catch((error)=>{
        res.status(500).json(error);
    })
});

// started the process or app listening to
// port retrieve from env var.
app.listen(APP_PORT, ()=>{
    console.log(`App started ${APP_PORT}`)}
);
