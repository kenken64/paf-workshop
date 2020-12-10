require('dotenv').config();
const express = require("express"),
      bodyParser = require("body-parser"),
      cors = require('cors'),
      multer = require('multer'),
      AWS = require('aws-sdk'),
      multerS3 = require('multer-s3');
 
const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(bodyParser.json({limit: '50mb'}));

const APP_PORT = process.env.APP_PORT;
const AWS_S3_HOSTNAME = process.env.AWS_S3_HOSTNAME;
const AWS_S3_ACCESS_KEY = process.env.AWS_S3_ACCESS_KEY;
const AWS_S3_SECRET_ACCESSKEY = process.env.AWS_S3_SECRET_ACCESSKEY;
const AWS_S3_BUCKETNAME = process.env.AWS_S3_BUCKETNAME;

const spaceEndPoint = new AWS.Endpoint(AWS_S3_HOSTNAME);

const s3 = new AWS.S3({
    endpoint: spaceEndPoint,
    accessKeyId: AWS_S3_ACCESS_KEY,
    secretAccessKey: AWS_S3_SECRET_ACCESSKEY
});

const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: AWS_S3_BUCKETNAME,
        acl: 'public-read',
        metadata: function(req, file,cb){
            console.log(file);
            cb(null, {
                fileName: file.fieldname,
                originalFilename: file.originalname,
                uploadDatetime: new Date().toString(),
                uploader: req.body.uploader,
                note: req.body.note
            })
        },
        key: function(req, file, cb){
            console.log(file);
            cb(null, new Date().getTime() + '_' + file.originalname);
        }
    }),
}).single('upload');

app.post('/upload', (req, res, next)=>{
    upload(req, res, (error)=>{
        if(error){
            console.log(error);
            return res.status(500).json(error.message);
        }
        console.log('file successfully uploaded');
        res.status(200).json({message: 'uploaded'});
    })
});

app.listen(APP_PORT, ()=>{
    console.log(`App servert started at ${APP_PORT}`);
});
