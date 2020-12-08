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
const queryComputeOrdersView = `SELECT * from compute_orders WHERE id=?`;

// 8. Establish connection , take in params and query the rdbms 
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

const startApp = async (app , pool) => {
    const conn = await pool.getConnection(); 
    try {
        console.log('Test database connection...');
        await conn.ping();
        // started the process or app listening to
        // port retrieve from env var.
        app.listen(APP_PORT, ()=>{
            console.log(`App started ${APP_PORT}`)}
        );
    }catch(e){
        console.log(e);
    }finally{
        conn.release();
    }

}

// 9. Create the closure function for the end point to
// perform crud operation against the database
const executeComputeOrdersView = makeQuery(queryComputeOrdersView, pool);

app.get('/order/total/:orderId', (req, res)=>{
    const orderId = req.params.orderId;
    console.log(orderId);
    console.log(' compute order details');
    executeComputeOrdersView([orderId]).then((results)=>{
        res.format({
            html: ()=>{
                console.log('html');
                res.send('<h1>Hi</h1>' + JSON.stringify(results));
            },
            json: ()=>{
                console.log('json');
                res.status(200).json(results);
            }
        });
    }).catch((err)=>{
        console.log(err)
        res.status(500).json(err);
    });
    
});

app.use((req,res)=>{
    res.redirect('/');
});

startApp(app, pool);
