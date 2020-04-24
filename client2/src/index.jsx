import React, { useState } from 'react'
import ReactDOM from 'react-dom'
import MapGL, { Layer, Source, Popup } from '@urbica/react-map-gl'
import { circle } from '@turf/turf'
import { useQuery } from 'react-query'
import { csv, scaleLog } from 'd3'
import { interpolateInferno as colorScheme } from 'd3-scale-chromatic'
import 'mapbox-gl/dist/mapbox-gl.css'
import './index.scss'
import x from 'url:../data/2020-04-24-oslo.csv'

const numberformat = Intl.NumberFormat('no-NB', { maximumSignificantDigits: 2 })
const asPrice = str => numberformat.format(Number(str)) + ' kr'
const asM2 = str => numberformat.format(Number(str)) + ' m²'
// price_per_m2
const heightScale = (str) => {
  const scale = scaleLog()
    .domain([15_000, 150_000])
    .range([1250, 250])
  return scale(Number(str))
}
const colorScale = (str) => {
  const scale = scaleLog()
    .domain([15_000, 150_000])
    .range([0, 1])
  return colorScheme(scale(Number(str)))
}

function useGeoJSON () {
  const { data: features } = useQuery('homes', async () => {
    const response = await csv(x)
    return response.map(d => {
      return circle([ Number(d.lng), Number(d.lat) ], 50, {
        units: 'meters',
        steps: 16,
        properties: {
          height: heightScale(d.price_per_m2),
          color: colorScale(d.price_per_m2),
          ...d
        }
      })
    })
  })
  
  return {
    type: 'FeatureCollection',
    features: features || []
  }
}

const HomePriceColumns = React.memo(function ({ data, onClick }) {
  return <>
    <Source id='homes' type='geojson' data={data} />
    <Layer
      id='homes'
      source='homes'
      type='fill-extrusion'
      onClick={e => {
        const lngLat = e.lngLat
        const home = e.features[0].properties
        onClick({ lngLat, home })
      }}
      paint={{
        'fill-extrusion-color': ['get', 'color'],
        'fill-extrusion-base': 0,
        'fill-extrusion-height': ['get', 'height'],
        'fill-extrusion-opacity': 0.7
      }}
    />
  </>
})



function App() {
  const geojson = useGeoJSON()

  const [viewport, setViewport] = useState({
    latitude: 59.891564151998836,
    longitude: 10.69875055934699,
    zoom: 10.885812649402158,
    pitch: 60,
    bearing: 7.2000000000000455
  })

  const [isVisible, setIsVisible] = useState(false)
  const [popup, setPopup] = useState({
    longitude: 10.69875055934699,
    latitude: 59.891564151998836,
    width: 400,
    home: {}
  })

  return <MapGL
    {...viewport}
    onViewportChange={setViewport}
    style={{ width: '100%', height: '100%' }}
    mapStyle='mapbox://styles/mapbox/dark-v8'
    accessToken={process.env.MapboxAccessToken}
    onClick={() => setIsVisible(false)}
  >
    {isVisible && <Popup {...popup}
      closeButton={false}
      closeOnClick={true}
      onClose={() => setIsVisible(false)}
    >
       <h2>{popup.home['Boligtype']} {asM2(popup.home['area'])} ({asPrice(popup.home['price'])})</h2>
       <p>(Per m²: {asPrice(popup.home['price_per_m2'])})</p>
       <a href={popup.home['url']}>{popup.home['url']}</a>
    </Popup>}
    <HomePriceColumns
      data={geojson}
      onClick={({ lngLat, home }) => {
        setPopup({ ...popup, longitude: lngLat.lng, latitude: lngLat.lat, home })
        setIsVisible(true)
      }}
    />
    
  </MapGL>
}

ReactDOM.render(<App />, document.getElementById('root'))