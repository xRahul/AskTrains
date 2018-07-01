import { Suggestion } from 'dialogflow-fulfillment'


function welcome(agent) {
  agent.add('Hi there. You can ask me for trains running between stations or ask for the live status of a train.')
  agent.add(new Suggestion('Trains from JP to BDTS'))
  agent.add(new Suggestion('Live status of 13008'))
}

export default welcome