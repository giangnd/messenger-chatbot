'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')
const app = express()

app.set('port', (process.env.PORT || 5000))

// Process application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// Process application/json
app.use(bodyParser.json())

app.set("view engine", "ejs")
app.set("views", "./views")

// const token = process.env.FB_PAGE_ACCESS_TOKEN
const token = "EAAEB79A3z5IBACswruLwuiSdMjZCVZCsZA9Bzy8tOm3HMUKOGJMa9UhtWJ7OwObPrZAk0iP18fuCpTxYuD11SXLiUuJNZAByy4XQh6FEG0ym6Lm5wkXZArZBdq2a8rcsjhKJksEBTnZCxPZB0Prbv0R4CBaaHCCmmtZC5cAtiZCxmOpBwZDZD"

// custom const
const APP_ID = 283604478840722
const PAGE_ID = 388558238011454
const messageDiscount = "MagixShop congrats you on activating your discount! Enter code SIGNUP15 at checkout stage to save 15% off your first purchase. Enjoy saving shopping NOW!";


// Index route
app.get('/', function (req, res) {
    res.render("index", {
        app_id: APP_ID,
        page_id: PAGE_ID,
        user_ref: Date.now(),
        token: token
    })
})

app.post('/discount/', function (req, res) {
    let user_ref = req.body.user_ref
    sendMessageByUserReg(user_ref, { text: messageDiscount }, res)
})

// for Facebook verification
app.get('/webhook/', function (req, res) {
    if (req.query['hub.verify_token'] === 'crowdbotics') {
        res.send(req.query['hub.challenge'])
    }
    res.send('Error, wrong token')
})

// to post data
app.post('/webhook/', function (req, res) {
    let messaging_events = req.body.entry[0].messaging
    for (let i = 0; i < messaging_events.length; i++) {
        let event = req.body.entry[0].messaging[i]
        console.log(event)

        if(event.sender){
            let sender = event.sender.id
            if (event.message && event.message.text && !event.message.is_echo) {
                let text = event.message.text
                if (text === 'Generic') {
                    const desc = "Hi there! We noticed there was an item left in your shopping cart. If you're ready to complete your order, your cart is waiting for your return."
                    sendTextMessage(sender, desc)
                    // sendGenericMessage(sender)
                    continue
                }
            }
        }
    }
    res.sendStatus(200)
})

// recommended to inject access tokens as environmental variables, e.g.
function sendTextMessage(sender, text) {
    let messageData = { text: text }
    sendMessageByUserId(sender, messageData)
}

function sendGenericMessage(sender) {
    let messageData = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": [
                {
                    "title": "Flower Piping Tips",
                    "subtitle": "1 x $35.00 USD",
                    "image_url": "https://cdn.shopify.com/s/files/1/2330/6765/products/maxresdefault-1080x675_419x.jpg",
                    "buttons": [{
                        "type": "web_url",
                        "url": "https://magixshop.com/",
                        "title": "Shop Now",
                    }],
                },
                {
                    "title": "Flower Piping Tips",
                    "subtitle": "1 x $35.00 USD",
                    "image_url": "https://cdn.shopify.com/s/files/1/2330/6765/products/maxresdefault-1080x675_419x.jpg",
                    "buttons": [{
                        "type": "web_url",
                        "url": "https://magixshop.com/",
                        "title": "Shop Now",
                    }],
                }
                ]
            }
        }
    }
    sendMessageByUserId(sender, messageData)
}

function sendMessageByUserId(sender, message) {
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: { access_token: token },
        method: 'POST',
        json: {
            recipient: { 
                id: sender 
            },
            message: message,
        }
    }, function (error, response, body) {
        if (error) {
            console.log('Error sending messages: ', error)
        } else if (response.body.error) {
            console.log('Error: ', response.body.error)
        }
    })
}

function sendMessageByUserReg(user_ref, message, reply) {
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: { access_token: token },
        method: 'POST',
        json: {
            recipient: { 
                user_ref: user_ref
            },
            message: message,
        }
    }, function (error, response, body) {
        if (error) {
            console.log('Error sending messages: ', error)
            reply.status(400).send(error)
        } else if (response.body.error) {
            console.log('Error: ', response.body.error)
            reply.status(400).send(response.body.error)
        } else {
            reply.status(200).send(body)
        }
    })
}

// Spin up the server
app.listen(app.get('port'), function () {
    console.log('running on port', app.get('port'))
})