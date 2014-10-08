import os
import datetime
import csv

reformat = []

timeFormat = "%Y%m%d%H%M"

data = open('hurricanes.dat')
csvData = csv.reader(data, delimiter=',')

lead = csvData.next()

while lead:

  numPoints = int(lead[2].lstrip(' '))
  name = lead[1].lstrip(' ').capitalize()

  print name, numPoints
  reformat.append(name + ', ' + str(numPoints))

  for i in range(numPoints):
    line = csvData.next()
    date = line[0].lstrip(' ')
    hour = line[1].lstrip(' ')
    cat  = line[3].lstrip(' ')
    lat  = line[4].lstrip(' ')
    lng  = line[5].lstrip(' ')

    # Format the timestamp

    time = date + hour

    date = datetime.datetime.strptime(time, timeFormat).isoformat()

    # N, E +
    # S, W -

    # Format the lattitude

    if 'S' in lat:
      lat = '-' + lat

    if 'W' in lng:
      lng = '-' + lng

    lat = lat.rstrip('NS')
    lng = lng.rstrip('EW')

    reformat.append(date + ', ' + lat + ', ' + lng + ', ' + cat)

  try:
    lead = csvData.next()
  except StopIteration:
    lead = False
    print '**EOF**'

for line in reformat:
  print line

data.close()

f = open('storms.dat', 'w')

for line in reformat:
  f.write(line + '\n')

f.close()