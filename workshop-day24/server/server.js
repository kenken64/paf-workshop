require('dotenv').config();
const express = require("express"),
    bodyParser = require("body-parser"),
    aws = require('aws-sdk'),
    multer = require('multer'),
    cors = require('cors'),
    multerS3 = require('multer-s3');

var app = express();

app.use(cors());
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(bodyParser.json({limit: '50mb'}));

const APP_PORT = process.env.APP_PORT;
const AWS_S3_HOSTNAME = process.env.AWS_S3_HOSTNAME;
const AWS_S3_ACCESSKEY_ID= process.env.AWS_S3_ACCESSKEY_ID;
const AWS_S3_SECRET_ACCESSKEY= process.env.AWS_S3_SECRET_ACCESSKEY;
const AWS_S3_BUCKET_NAME=process.env.AWS_S3_BUCKET_NAME;

const spacesEndpoint = new aws.Endpoint(AWS_S3_HOSTNAME);
const s3 = new aws.S3({
  endpoint: spacesEndpoint,
  accessKeyId: AWS_S3_ACCESSKEY_ID,
  secretAccesssKey: AWS_S3_SECRET_ACCESSKEY
});

const upload = multer({
    storage: multerS3({
      s3: s3,
      bucket: AWS_S3_BUCKET_NAME,
      acl: 'public-read',
      metadata: function (req, file, cb) {
        cb(null, {
            fieldName: file.fieldname,
            originalFileName: file.originalname,
            uploadTimeStamp: new Date().toString(),
            uploader: req.body.uploader? req.body.uploader: req.query.uploader,
            note: req.body.note ? req.body.note: req.query.note
        });
      },
      key: function (request, file, cb) {
        console.log(file);
        cb(null, new Date().getTime()+'_'+ file.originalname);
      },
      limits: { fileSize: 20000000 },
    })
  }).array('uploads', 10);

app.post('/upload', (request, response, next)=> {
    upload(request, response, (error)=> {
        if (error) {
          console.log(error);
          response.status(500).json({error: error.message});
        }
        console.log('File uploaded successfully.');
        let fileArray = response.req.files,
            fileLocation;
        const images = [];
        for (let i = 0; i < fileArray.length; i++) {
            fileLocation = fileArray[i].location;
            console.log('filenm', fileLocation);
            images.push(fileLocation)
        }
        response.status(200).json({
          message: "uploaded",
          s3_file_key: images
        });
    });
});

async function downloadFromS3(params, res){
    const metaData = await s3.headObject(params).promise();
    console.log(metaData);
    res.set({
        'X-Original-Name': metaData.Metadata.originalfilename,
        'X-Create-Time': metaData.Metadata.uploadtimestamp,
        'X-Uploader': metaData.Metadata.uploader,
        'X-Notes': metaData.Metadata.note
      })
    s3.getObject(params, function(err, data) {
        if (err) console.log(err, err.stack);
        let fileData= data.Body.toString('utf-8');
        res.send(fileData);
    });
}

app.get('/blob/:key', (req,res)=>{
    const keyFilename = req.params.key;
    var params = {
        Bucket: AWS_S3_BUCKET_NAME,
        Key: keyFilename
    };
    downloadFromS3(params, res);
});

app.listen(APP_PORT, () => {
    console.info(`Application started on port ${APP_PORT} at ${new Date()}`);
});