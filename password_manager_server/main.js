//import { generateRandomString } from 'util.js';
const util = require("./util");
const https = require("https");
const express = require("express");
const redis = require("redis");
const app = express();
const fs = require('fs');

const redisClient = redis.createClient();


redisClient.on("error", (err) => {
    console.log(err);
});
redisClient.connect();

app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

app.use(express.json());



app.get("/import/:id", async (req, res) => {
    const val = await redisClient.get(req.params.id);
    if(val === null)
        res.send({valid: false, message: 'Non trovato'});
    else{
        await redisClient.del(req.params.id);
        res.send({valid:true, data: JSON.parse(val)});
    }
});

app.post("/export", async (req, res) => {
    var token = null;
    do{
        token = util.randomString(5);
        var val = await redisClient.get(token)
    }while(val !== null);
    await redisClient.set(token,JSON.stringify(req.body))
    res.send({valid: true, token: token});
});
//res.header("Access-Control-Allow-Origin", "*");



const httpsServer = https.createServer({
    key: fs.readFileSync('/etc/pki/tls/private/httpd.key'),
    cert: fs.readFileSync('/etc/pki/tls/certs/httpd.crt'),
  }, app);

httpsServer.listen(8000, () => {
    console.log('Server HTTPS avviato sulla porta 8000');
});