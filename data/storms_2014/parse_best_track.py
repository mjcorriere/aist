import os
import datetime
import csv

def addDecimal(coord):

  l = list(coord)
  l.insert(-1, '.')
  return ''.join(l)

dataDir = 'data/'
timeFormat = "%Y%m%d%H"

TIME_COL     = 2
LAT_COL      = 6
LNG_COL      = 7
CATEGORY_COL = 10

FILE_EXT     = '.dat'

files = [f for f in os.listdir(dataDir) if FILE_EXT in f]

parsed = []

for f in files:

  name    = f.split('.')[0].capitalize()
  data    = open(dataDir + f)
  csvData = csv.reader(data, delimiter=',')

  reformat = []
  lines    = 0

  for line in csvData:

    lines += 1

    time = line[TIME_COL].strip()
    lat  = line[LAT_COL].strip()
    lng  = line[LNG_COL].strip()
    cat  = line[CATEGORY_COL].strip()

    # Format the timestamp
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

    lat = addDecimal(lat)
    lng = addDecimal(lng)

    reformat.append(date + ', ' + lat + ', ' + lng + ', ' + cat)

  parsed.append(name + ', ' + str(lines))
  parsed = parsed + reformat

  data.close()

out = open('storms2014.dat', 'w')

for line in parsed:
  out.write(line + '\n')

out.close()