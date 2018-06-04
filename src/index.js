// See https://github.com/dialogflow/dialogflow-fulfillment-nodejs
// for Dialogflow fulfillment library docs, samples, and to report issues
'use strict'

import {
  WebhookClient
} from 'dialogflow-fulfillment'
import express from 'express'
import bodyParser from 'body-parser'

import { log } from './custom'
import {
  welcome,
  fallback,
  listTrains,
  liveTrainStatus
} from './intents'

process.env.DEBUG = 'dialogflow:debug' // enables lib debugging statements

const port = process.env.PORT || 8080
const server = express()
server.use(bodyParser.urlencoded({
  extended: true
}))
server.use(bodyParser.json())

server.post('/askTrains', function (request, response) {
  const agent = new WebhookClient({
    request,
    response
  })

  // Run the proper function handler based on the matched Dialogflow intent name
  let intentMap = new Map()
  intentMap.set('Default Welcome Intent', welcome)
  intentMap.set('Default Fallback Intent', fallback)
  intentMap.set('List Trains', listTrains)
  intentMap.set('Train Live Status', liveTrainStatus)
  intentMap.set('listTrains.context', listTrains)
  agent.handleRequest(intentMap)

})

server.listen(port, function () {
  log(`AskTrains is listening on port ${port}!\n\n\n`)
})