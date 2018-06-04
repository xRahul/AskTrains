import { Suggestion } from 'dialogflow-fulfillment'


function fallback(agent) {
  agent.add('Sorry, I didn\'t get that. You can ask me for trains running between stations or ask for the live status of a train.')
  agent.add(new Suggestion('Show trains from JP to BDTS for tomorrow.'))
  agent.add(new Suggestion('What is the live status of 13008 for yesterday?'))
}

export default fallback