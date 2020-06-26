'use strict'
/*
mostly copied (except for python addition) from following link:
https://www.youtube.com/watch?v=bUwiKFTvmDQ&t=889s
follow this and you should be able to launch with heroku

*/
const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')
const {spawn} = require("child_process");
const port = 5000
const app = express()

app.set('port', (process.env.PORT || 5000))


// allows to process data

app.use(bodyParser.urlencoded({ extended :false}))
app.use(bodyParser.json())
// routes

app.get("/", function(req, res){
    //res.send("howdy, hopefully this code works")
    var dataToSend;
    const python = spawn("python", ["script1.py"]);
    // send data from python script
    python.stdout.on("data", function(data){
        console.log("Pipe data from python script ... ")
        dataToSend = data.toString();
    });
    python.on("close", (code) => {
        console.log("child process close all stdio with code ${code}");
        res.send(dataToSend)
    })
})


let token = "<YOUR AUTHENTICATION TOKEN HERE>"
// facebook

app.get('/webhook/', function(req, res){
    if(req.query["hub.verify_token"] === "<YOUR VERIFICATION TOKEN HERE>") {
        res.send(req.query["hub.challenge"])
    }
    res.send("Wrong token")
})

app.post("/webhook/", function(req, res){
    let messaging_events = req.body.entry[0].messaging
    


    for (let i =0; i < messaging_events.length; i++){
        

        let event = messaging_events[i]
        let sender = event.sender.id
        
        if(event.message && event.message.text){
            let text = event.message.text
            var dataToSend;
            const python = spawn("python", ["script1.py"]);
    // send data from python script
            python.stdout.on("data", function(data){
                console.log("Pipe data from python script ... ")
                dataToSend = data.toString();
            });
            python.on("close", (code) => {
                console.log("child process close all stdio with code ${code}");
                sendText(sender, "Text echo: "+ dataToSend.substring(0, 100))
            })
            
        }
    }
    res.sendStatus(200)
})


function sendText(sender, text){
    let messageData = {text: text}
    request({
        url : "https://graph.facebook.com/v7.0/me/messages",
        qs : {access_token : token},
        method: "POST",
        json:{
            recipient: {id: sender},
            message : messageData
        }
    }, function (error, response, body) {
        if(error){
            console.log("sending error")
        } else if (response.body.error){
            console.log("response body error")
        }
    })
}

app.listen(app.get("port"), function(){
    console.log("running: port")
})