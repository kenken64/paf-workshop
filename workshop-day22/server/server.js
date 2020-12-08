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

const queryOrderByTotal = "SELECT * FROM northwind.compute_orders WHERE id=?";


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
            return Promise.reject(err);
        } finally {
            conn.release();
        }
        
    });
};

const startApp = async (app, pool) => {
	const conn = await pool.getConnection()
	try {
		console.info('Pinging database...')
		await conn.ping()
		app.listen(APP_PORT, () => {
			console.info(`Application started on port ${APP_PORT} at ${new Date()}`)
		})
	} catch(e) {
        console.error('Cannot ping database', e);
    } finally {
		conn.release()
	}
}


const findOrderByTotal = makeQuery(queryOrderByTotal, pool);


app.get("/order/total/:orderId", (req, res)=> {
    let orderId = req.params.orderId;
    findOrderByTotal([orderId])
        .then((results)=> {
            for (let r of results)
                console.log(r.id)
            res.format({ 
                html: function () { 
                    console.log("html");
                    res.send(results); 
                }, 
                json: function () {
                    console.log("json");
                    res.status(200).json(results);
                } 
            }); 
        })
        .catch((err) => {
            console.log(err);
            res.status(500).end();
        });
});

app.use((req, resp) => {
	resp.redirect('/')
})


startApp(app, pool);