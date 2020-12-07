const express = require("express"),
      bodyParser = require("body-parser"),
      secureEnv = require('secure-env'),
      cors = require('cors'),
      mysql = require("mysql2/promise");

var app = express();

app.use(cors());
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(bodyParser.json({limit: '50mb'}));

global.env = secureEnv({secret:'isasecret'});
const APP_PORT = global.env.APP_PORT;

const pool = mysql.createPool({
    host: global.env.MYSQL_SERVER,
    port: global.env.MYSQL_PORT,
    user: global.env.MYSQL_USERNAME,
    password: global.env.MYSQL_PASSWORD,
    database: global.env.MYSQL_SCHEMA,
    connectionLimit: global.env.MYSQL_CONNECTION
});
console.log(pool);

const queryAllRsvp = "SELECT id, name, email, phone, status, createdBy, createdDt, updatedBy, updatedDt FROM rsvp order by createdDt desc";
const insertRsvp = "INSERT INTO rsvp (name, email, phone, status, createdBy, createdDt ) VALUES (? ,? ,?, ?, ?, CURDATE())";


const makeQuery = (sql, pool) =>  {
    console.log(sql);
    return (async (args) => {
        const conn = await pool.getConnection();
        try {
            let results = await conn.query(sql, args || []);
            console.log(results[0]);
            return results[0];
        }catch(err){
            console.log(err);
        } finally {
            conn.release();
        }
        
    });
};


const findAllRsvp = makeQuery(queryAllRsvp, pool);
const saveRsvp = makeQuery(insertRsvp, pool);


app.get("/api/rsvps", (req, res)=> {
    findAllRsvp([])
        .then((results)=> {
            for (let r of results)
                console.log(r.id)
            res.status(200).json(results);
        })
        .catch((err) => {
            console.log(err);
            res.status(500).end();
        });
});

app.post("/api/rsvps", (req, res) => {
    console.log(req.body);
    saveRsvp([req.body.name, req.body.email ,req.body.phone, req.body.status, 1])
        .then(function (result) {
            res.status(200).json(result);
        })
        .catch(function (err) {
            console.log(err);
            res.status(500).send(err);
        });
});


app.listen(APP_PORT, ()=>{
    console.log(`Express server started at ${APP_PORT}`)
});
