import moment from 'moment'
import 'isomorphic-fetch'

import { log, capitalize } from '../custom'
import { railwayApiKey } from '../constants'

function liveTrainStatus(agent) {
  const { trainNumber, startDate } = getApiData(agent.parameters)

  if (!trainNumber) {
    agent.add(`Sorry, I am unable to find the train ${agent.parameters.fromStation}`)
    return
  }


  return callRailwayApi(trainNumber, startDate)
    .then((trainLiveData) => {
      agent.add(getTrainLiveDataResponse(trainLiveData))
    })
    .catch((error) => {
      agent.add('Can not find live data for train ' + trainNumber + ' for date ')
      log(error)
    })
}


function getTrainLiveDataResponse(trainLiveData) {
  return capitalize(trainLiveData.train.name) + ' ' + trainLiveData.position +
    '  ' + getNextStationResponse(trainLiveData)
}


function getNextStationResponse(trainLiveData) {
  const firstRouteStation = trainLiveData.route[0]
  if (!firstRouteStation.has_arrived) {
    return 'The train will start from ' + capitalize(firstRouteStation.station.name) +
    ' at ' + firstRouteStation.schdep
  }

  const lastRouteStation = trainLiveData.route[trainLiveData.route.length - 1]
  if (lastRouteStation.has_arrived) {
    return 'The train has reached the final station ' + capitalize(firstRouteStation.station.name) +
    ' at ' + firstRouteStation.actarr
  }

  let currentStation
  for (let i = 0; i < trainLiveData.route.length; i++) {
    currentStation = trainLiveData.route[i]
    if (!currentStation.has_arrived) {
      return 'The next station is ' + capitalize(currentStation.station.name) +
       ' (' + currentStation.station.code + ')' +
       ' and the train will arrive by ' + currentStation.scharr
    }
  }

  return ''
}


function callRailwayApi(trainNumber, date) {
  return new Promise((resolve, reject) => {
    fetch('https://api.railwayapi.com/v2/live/train/' + trainNumber + '/date/' + date + '/apikey/' + railwayApiKey + '/')
      .then((response) => response.json())
      .then((response) => {
        if (response.response_code == 200) {
          resolve(response)
        }
        reject()
      })
      .catch((error) => {
        log(error)
        reject()
      })
  })

}


function getApiData(parameters) {
  const trainNumber = parameters.trainNumber

  let startDate = moment().format('DD-MM-YYYY')
  if (parameters['startDate']) {
    const paramStartDate = moment(parameters['startDate']).format('DD-MM-YYYY')
    startDate = paramStartDate

    const today = moment()
    const parsedParamStartDate = moment(parameters['startDate'])
    const parsedParamStartDateMinusYear = parsedParamStartDate.subtract(1, 'years')

    if (Math.abs(today.diff(parsedParamStartDate, 'days')) >= Math.abs(today.diff(parsedParamStartDateMinusYear, 'days'))) {
      startDate = parsedParamStartDateMinusYear.format('DD-MM-YYYY')
    }
  }

  log('Parameters: ' + trainNumber + ', ' + startDate)
  return { trainNumber, startDate }
}


export default liveTrainStatus