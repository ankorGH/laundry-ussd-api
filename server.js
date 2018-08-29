const config = require("./config")
const express = require("express")
const app = express()
const port = config.port

const Pubnub = require("pubnub")

const options = {
    apiKey:config.africasTalking.apiKey,
    username:config.africasTalking.username
}

const pubnub = new Pubnub({
    subscribeKey:config.pubnub.subscribeKey,
    publishKey:config.pubnub.publishKey,
    ssl:true
})

const AfricasTalking = require("africastalking")(options)

let userDetails = {}

const services = {
    1:"Washing",
    2:"Ironing",
    3:"Cleaning"
}

const halls = {
    1:"Gold Hall",
    2:"KT Hall",
    3:"Chambers",
    4:"Mystique Fall",
    5:"Waterloo"
}


app.post("/api/ussd",new AfricasTalking.USSD((params,next) => {
    let endSession = false
    let response = ""
    
    const {text,phoneNumber} = params
    const textValue =  text.split("*")
    
    if(text === ""){
        response += "Welcome to Tobi's Cleaning and Laundry Services\n"
        response += "Please select a service:\n"
        response += "1. Washing\n"
        response += "2. Ironing\n"
        response += "3. Cleaning"
    }else if(textValue.length === 1 && checkResponseValidity(textValue[0],3)){
        response += "Select your hall/hostel.\n"
        response += "1. Gold Hall\n"
        response += "2. Kofi Tetteh Hall\n"
        response += "3. Chamber of Mines Hall\n"
        response += "4. Mystique Falls Hostel\n"
        response += "5. Waterloo Hostel\n"

        userDetails.service = services[textValue[0]] 
    }else if(textValue.length === 2 && checkResponseValidity(textValue[1],5)){
        response += "Enter your name\n"

        userDetails.hall = halls[textValue[1]]
    }
    else if(textValue.length === 3){
        response += "Enter your room number\n"

        userDetails.name = textValue[2]
    }
    else if(textValue.length === 4){
        response += "Enter your phone number or 1 to use this phone's number\n"

        userDetails.roomNumber = textValue[3]
    }else if(textValue.length === 5){
        response += "Thank you for patronizing our service. Our customer support will contact you soon.\n"

        if(textValue[4] === "1"){
            userDetails.phoneNumber = phoneNumber 
        }else{
            userDetails.phoneNumber = textValue[4]
        }
        endSession = true
    }else{
        response = "Invalid Option"
        endSession = true
    }

    if(userDetails.service && userDetails.hall && userDetails.name && userDetails.phoneNumber){
        pubnub.publish({
            message:userDetails,
            channel:"send:userDetails",
            sendByPost:false,
            storeInHistory:false
        
        },(status,response) => {
            if(!status.error) {
                console.log(`message published on ${response.timetoken}`)
                userDetails = {}
            }
        })
    }
    
    next({
        response,
        endSession
    })
}))

function checkResponseValidity(response,length){
    return parseInt(response) <= length
}

app.listen(port,() => {
    console.log(`Server is running at port ${port}`)
})