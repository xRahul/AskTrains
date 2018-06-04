import didYouMean from 'didyoumean'
import moment from 'moment'
import 'isomorphic-fetch'
import {
  // Table,
  List
} from 'actions-on-google'


import { log, capitalize } from '../custom'
import { stationData, stationDataKeys, railwayApiKey } from '../constants'


function listTrains(agent) {
  let result = ''
  const { fromStationCode, toStationCode, date } = getApiData(agent.parameters)

  if (!fromStationCode) {
    agent.add(`Sorry, I am unable to find the station ${agent.parameters.fromStation} you're boarding from`)
    return
  }
  if (!toStationCode) {
    agent.add(`Sorry, I am unable to find the station ${agent.parameters.toStation} you're going to`)
    return
  }


  return callRailwayApi(fromStationCode, toStationCode, date)
    .then((listOfTrains) => {
      if (agent.requestSource === agent.ACTIONS_ON_GOOGLE) {
        createGoogleActionsTrainsList(agent, fromStationCode, toStationCode, date, listOfTrains)
      } else {
        listOfTrains.forEach((train) => {
          result += ', ' + capitalize(train.name)
        })
        result = result.substring(2)
        agent.add(result)
      }
    })
    .catch((error) => {
      agent.add('Can not find trains between ' + fromStationCode + ' and ' + toStationCode + ' for ' + date)
      log(error)
    })
}


function createGoogleActionsTrainsList(agent, fromStationCode, toStationCode, date, listOfTrains) {
  let conv = agent.conv()

  if (!conv.surface.capabilities.has('actions.capability.SCREEN_OUTPUT')) {
    conv.ask('Sorry, try this on a screen device or select the phone surface in the simulator.')
    agent.add(conv)
    log('actions.capability.SCREEN_OUTPUT not present')
    return
  }

  conv.ask('Please choose a train:')
  log('Please choose a train:')

  // const tableProperties = {
  //   title: 'Trains',
  //   subtitle: fromStationCode + '-' + toStationCode + ' | ' + date,
  //   dividers: true,
  //   columns: ['Number', 'Name', 'Stations', 'Days'],
  //   rows: getTrainsTableRows(listOfTrains)
  // }
  // log(tableProperties)
  // conv.ask(new Table(tableProperties))

  const listProperties = {
    title: 'Trains | ' + fromStationCode + '-' + toStationCode + ' | ' + date,
    items: getTrainsListItems(listOfTrains)
  }
  log(listProperties)
  conv.ask(new List(listProperties))

  agent.add(conv)
}


function getTrainsListItems(listOfTrains) {
  const trainsListItems = {}
  listOfTrains.forEach((trainItem) => {
    trainsListItems[trainItem.number] = {
      title: '(' + trainItem.number + ')  ' + capitalize(trainItem.name),
      description: getTrainTravelTime(trainItem) + ' | ' +
      getTrainStations(trainItem) + ' | ' + getTrainDays(trainItem.days)
    }
  })
  return trainsListItems
}

function getTrainTravelTime(trainItem) {
  return 'Time: ' + trainItem.travel_time +
  ' (' + trainItem.src_departure_time + ' - ' + trainItem.dest_arrival_time + ')'
}


// function getTrainsTableRows(listOfTrains) {
//   const trainsRows = []

//   listOfTrains.forEach((trainItem) => {
//     trainsRows.push([
//       trainItem.number,
//       trainItem.name,
//       getTrainStations(trainItem),
//       getTrainDays(trainItem.days)

//     ])
//   })

//   return trainsRows
// }


function getTrainStations(trainItem) {
  return trainItem.from_station.code + '-' + trainItem.to_station.code
}


function getTrainDays(days) {
  return days.map(function(day){
    if (day.runs == 'Y') {
      return day.code.substring(0,1)
    }
    return '_'
  }).join('')
}

function getApiData(parameters) {
  const fromStationCode = getStationCode(parameters.fromStation)
  const toStationCode = getStationCode(parameters.toStation)

  let date = moment().format('DD-MM-YYYY')
  if (parameters['date']) {
    date = moment(parameters['date']).format('DD-MM-YYYY')
  }

  log('Parameters: ' + fromStationCode + ', ' + toStationCode + ', ' + date)
  return { fromStationCode, toStationCode, date }
}


function getStationCode(station) {
  let stationCode = ''
  const closestMatch = didYouMean(station, stationDataKeys)
  if (closestMatch) {
    stationCode = stationData[closestMatch].stationCode
  }
  return stationCode
}


function callRailwayApi(fromStationCode, toStationCode, date) {
  return new Promise((resolve, reject) => {
    fetch('https://api.railwayapi.com/v2/between/source/' + fromStationCode + '/dest/' + toStationCode + '/date/' + date + '/apikey/' + railwayApiKey + '/')
      .then((response) => response.json())
      .then((response) => {
        if (response.response_code == 200) {
          resolve(response.trains)
        }
        reject()
      })
      .catch((error) => {
        log(error)
        reject()
      })
  })

}

export default listTrains