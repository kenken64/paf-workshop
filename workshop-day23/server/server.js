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
    database: global.env.MYSQL_DATABASE,
    connectionLimit: global.env.MYSQL_CONNECTION
});

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

const insertOrders= async(employeeId, customerId, productId)=>{
    const conn = await pool.getConnection();
    try{
        await conn.beginTransaction();
        console.log(employeeId);
        console.log(customerId);
        console.log(productId);
        let orderResult = await conn.query(`INSERT INTO ORDERS_wkshp23 
            (EMPLOYEE_id, CUSTOMER_id) values (?,?)`, [employeeId,customerId]);
        console.log(orderResult[0].insertId);
        let orderDetailsResult = await conn.query(`INSERT INTO ORDER_DETAILS_wrkshp23 
            (order_id, product_id) values (?,?)`, [orderResult[0].insertId,productId]);
        console.log(orderDetailsResult[0]);
        await conn.commit();
    }catch(e){
        conn.rollback();
        res.status(500).json({err: e.message});
    }finally {
        conn.release();
    }
}

app.post("/order", (req, res)=> {
    const employeeId = req.body.employeeId;
    const customerId = req.body.customerId;
    const productId = req.body.productId;
    if(productId == '22'){
        productId = NULL;
    }
    insertOrders(employeeId, customerId, productId);
    res.status(200).json({});
});

app.use((req, resp) => {
	resp.redirect('/')
})

startApp(app, pool);
