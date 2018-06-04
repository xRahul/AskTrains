import { Suggestion } from 'dialogflow-fulfillment'


function welcome(agent) {
  agent.add('Hi there. You can ask me for trains running between stations or ask for the live status of a train.')
  agent.add(new Suggestion('Show trains from JP to BDTS for tomorrow.'))
  agent.add(new Suggestion('What is the live status of 13008 for yesterday?'))
}

export default welcome