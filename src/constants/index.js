import fs from 'fs'

export const stationData = JSON.parse(fs.readFileSync('data/station.json', 'utf8'))

export const stationDataKeys = Object.keys(stationData)

const railwayApiKeys = [process.env.RAILWAY_API_KEY]

export const railwayApiKey = railwayApiKeys[Math.floor(Math.random()*railwayApiKeys.length)]
