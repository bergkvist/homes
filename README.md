# bergkvist/homes
Visualization of variations in home prices per m² in the Oslo and Akershus area (https://homes.bergkv.ist)

## Scraper (data source):

Python3 with the requests library and BeautifulSoup are used to scrape the Norwegian sales website finn.no.

The scraped data is stored as a csv-file, which is later loaded into the browser/client for visualization.


## Client (visualization):

The visualization all takes part inside a browser.

The csv-file is loaded/parsed using "d3" - which then computes a color and height for every apartment.

Using "turf", the data is turned into a GeoJSON FeatureCollection of circle-polygons.

Using "mapbox-gl" with "dark matter" as the background map, the apartments are added as a "fill-extrusion"-layer (which is how the 2D-circle-polygons becomes 3D-cylinders).
