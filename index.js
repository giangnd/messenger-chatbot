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

// Index route
app.get('/', function (req, res) {
    res.send('Hello world, I am a chat bot')
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
        let sender = event.sender.id
        console.log(sender)
        if (event.message && event.message.text) {
            let text = event.message.text
            if (text === 'Generic') {
                const desc = "Hi there! We noticed there was an item left in your shopping cart. If you're ready to complete your order, your cart is waiting for your return."
                sendTextMessage(sender, desc)
                sendGenericMessage(sender)
                continue
            }
        }
    }
    res.sendStatus(200)
})

// recommended to inject access tokens as environmental variables, e.g.
// const token = process.env.FB_PAGE_ACCESS_TOKEN
const token = "EAAEB79A3z5IBACswruLwuiSdMjZCVZCsZA9Bzy8tOm3HMUKOGJMa9UhtWJ7OwObPrZAk0iP18fuCpTxYuD11SXLiUuJNZAByy4XQh6FEG0ym6Lm5wkXZArZBdq2a8rcsjhKJksEBTnZCxPZB0Prbv0R4CBaaHCCmmtZC5cAtiZCxmOpBwZDZD"

function sendTextMessage(sender, text) {
    let messageData = { text: text }
    makeRequest(sender, messageData)
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
    makeRequest(sender, messageData)
}

function makeRequest(sender, message) {
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: { access_token: token },
        method: 'POST',
        json: {
            recipient: { id: sender },
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

// Spin up the server
app.listen(app.get('port'), function () {
    console.log('running on port', app.get('port'))
})