'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')
const cors = require('cors')
const app = express()

app.set('port', (process.env.PORT || 5000))

// Process application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// Process application/json
app.use(bodyParser.json())

app.use(cors())

app.set("view engine", "ejs")
app.set("views", "./views")

// const token = process.env.FB_PAGE_ACCESS_TOKEN
const token = "EAAEB79A3z5IBAFWCO5DDGXgbZCZBdrlACMdLRfgR45EPNNbr8fUo9kHPkqvF0gVUT79UkDfAba35Hzn37dbmxzYm5qXWlsgNYss7oSAn366ExKbUSjFcrZBoA60OuIpAuGW8cWbfl03okLJG3Ak8vh1g4hs5HKJum6botoKNRLJY8J6sPma"

// custom const
const APP_ID = 283604478840722
const PAGE_ID = 178407809574589
const messageDiscount = "MagixShop congrats you on activating your discount! Enter code MFB10 at checkout stage to save 10% off your first purchase Enjoy saving shopping NOW!";

// Index route
app.get('/', function (req, res) {
	res.render("index", {
		app_id: APP_ID,
		page_id: PAGE_ID,
		ref: 'magixshop',
		user_ref: Date.now()
	})
})

app.post('/discount/', function (req, res) {
	let user_ref = req.body.user_ref
	sendMessageByUserReg(user_ref, { text: messageDiscount }, res)
})

// for Facebook verification
app.get('/webhook/', function (req, res) {
	console.log(req.query);
	if (req.query['hub.verify_token'] === 'magixshop') {
		res.send(req.query['hub.challenge'])
	}
	res.end('Error, wrong token')
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

				if(text.toLowerCase() === 'generic'){
					sendTextMessage(sender, "Hi there! We noticed there was an item left in your shopping cart. If you're ready to complete your order, your cart is waiting for your return.")
					continue
				}

				if(text.toLowerCase() === 'about'){
					sendTextMessage(sender, "Discover great deals on extraordinary gadgets at Magix Shop. Our items are curated weekly for modern guys and gals like yourself. Have fun shopping!")
					continue
				}

				if (text.toLowerCase() === 'cart') {
					sendGenericMessage(sender)
					continue
				}

				if(text.toLowerCase() === 'menu'){
					sendMenuMessage(sender)
					continue
				}

				sendTextMessage(sender, "Text received: " + text.substring(0, 200))
			}
			if (event.postback) {
				let text = JSON.stringify(event.postback)
				sendTextMessage(sender, text.substring(0, 200), token)
				continue
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
					"title": "USB Blender Bottle 2018",
					"subtitle": "1 x $49.98",
					"image_url": "https://cdn.shopify.com/s/files/1/2330/6765/products/USB-Blender-Bottle-2018-thumbnail_1_500x.jpg",
					"buttons": [{
						"type": "web_url",
						"url": "https://magixshop.com/collections/other-gadgets/products/usb-blender-bottle-2018",
						"title": "Shop Now",
					}],
				},
				{
					"title": "Quick Kebab Maker Box",
					"subtitle": "1 x $32.99",
					"image_url": "https://cdn.shopify.com/s/files/1/2330/6765/products/Quick-Kebab-Maker-Box-thumbnail_13_500x.jpg",
					"buttons": [{
						"type": "web_url",
						"url": "https://magixshop.com/collections/kitchen-gadgets/products/quick-kebab-maker-box",
						"title": "Shop Now",
					}],
				}
				]
			}
		}
	}
	sendMessageByUserId(sender, messageData)
}

function sendMenuMessage(sender){
	let messageData = {
		"attachment":{
			"type":"template",
			"payload":{
				"template_type":"button",
				"text":"What do you want to do next?",
				"buttons":[
				{
					"title":"Shopping Now",
					"type":"web_url",
					"url":"https://magixshop.com/collections/all-products",
				},
				{
					"title":"About",
					"type":"web_url",
					"url":"https://magixshop.com/pages/about-magix-shop",
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