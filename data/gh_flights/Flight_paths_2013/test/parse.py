import os
import csv
import datetime

directoryName = 'data'
timeCol = 1
latCol  = 2
lngCol  = 3

timeFormat = '%Y-%m-%dT%H:%M:%S'
# Hours
hoursThreshhold = 2
secondsThreshold = hoursThreshhold * 60 * 60
parsedFiles = {}

for fileName in os.listdir(directoryName):
  print 'parsing ' + fileName

  data = open(directoryName + '/' + fileName)
  csvData = csv.reader(data, delimiter=',')
  
  filteredData = []

  firstLine = csvData.next();
  timeStamp = firstLine[timeCol].split('.')[0]
  prevTime = datetime.datetime.strptime(timeStamp, timeFormat)
  
  for line in csvData:
    timeStamp = line[timeCol].split('.')[0]
    currTime  = datetime.datetime.strptime(timeStamp, timeFormat)

    deltaT = currTime - prevTime

    if deltaT.seconds >= secondsThreshold:
      lat  = line[latCol]
      lng  = line[lngCol]
      time = currTime.isoformat()
      
      filteredData.append([time, lat, lng])

      prevTime = currTime

  for entry in filteredData:
    print entry

  parsedFiles[fileName] = filteredData
  print parsedFiles





# 2013-09-05T13:47:10.000