import './style.scss'
import 'mapbox-gl/dist/mapbox-gl.css'
import homesLink from './oslo-akershus.csv'
import { interpolateInferno as colorScheme } from 'd3-scale-chromatic'
import * as d3 from 'd3'
import * as mapboxgl from 'mapbox-gl'
import * as turf from '@turf/turf'

// This is just here to allow something similar to hmr to work in fuse-box v4
if (window.loaded) {
    window.location.reload()
} else {
  window.loaded = true

  const scenario = [
    { key: 'price_per_m2', domain: [15_000, 150_000], scale: 'scaleLog' },
    { key: 'priceyness', domain: [-1, 1], scale: 'scaleLinear' }
  ][0]


  const colorScale = (str: string) => {
    const scale = d3[scenario.scale]().domain(scenario.domain).range([0, 1])
    return colorScheme(scale(Number(str)))
  }

  const heightScale = (str: string) => {
    const scale = d3[scenario.scale]().domain(scenario.domain).range([500,2500])
    return scale(Number(str))
  }

  const map = new mapboxgl.Map({
    container: 'map',
    center: [10.778400724999756, 59.89863797743362],
    zoom: 10.710328524804181,
    pitch: 42,
    style: {
      version: 8,
      sources: {
        'basemap': {
          type: 'raster',
          tiles: ['a', 'b', 'c']
            .map(x => `http://${x}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png`)
        },
      },
      layers: [{
        id: 'basemap',
        type: 'raster',
        source: 'basemap',
        minzoom: 0,
        maxzoom: 22
      }]
    }
  })
  map.addControl(new mapboxgl.NavigationControl())

  console.log(heightScale('15000'))

  const numberformat = Intl.NumberFormat('no-NB', { maximumSignificantDigits: 2 })
  const asPrice = (str: string) => numberformat.format(Number(str)) + ' kr'
  const asM2 = (str: string) => numberformat.format(Number(str)) + ' m²'
  const homeHTML = home => `<h2>${home['Boligtype']} ${asM2(home.area)} (${asPrice(home.price)})</h2><p>(Per m²: ${asPrice(home.price_per_m2)})</p><a href="${home.url}">${home.url}</a>`

  d3.csv(homesLink).then(data => {
    const geojson = {
      type: 'FeatureCollection',
      features: data
        //.filter(d => d['Boligtype'] === 'Leilighet')
        .map(d => turf.circle([
          Number(d.lng), 
          Number(d.lat),
        ], 100, { units: 'meters', steps: 16, properties: {
          height: heightScale(d[scenario.key]),
          color: colorScale(d[scenario.key]),
          ...d
        } }))
    } as any

    console.log(geojson.features[0].properties)

    map.on('load', () => {
      map.addLayer({
        type: 'fill-extrusion',
        id: 'homes',
        source: {
          type: 'geojson',
          data: geojson
        },
        paint: {
          'fill-extrusion-color': ['get', 'color'],
          'fill-extrusion-base': 0,
          'fill-extrusion-height': ['get', 'height'],
          'fill-extrusion-opacity': 0.7
        }
      })
    })

    map.on('click', 'homes', e => {
      return new mapboxgl.Popup()
        .setLngLat(e.lngLat)
        .setHTML(homeHTML(e.features[0].properties))
        .setMaxWidth('400px')
        .addTo(map)
    })

    window.addEventListener('keydown', e => {
      if (e.keyCode === 188) {
        console.log(`center: [${map.getCenter().toArray().join(', ')}], pitch: ${map.getPitch()}, zoom: ${map.getZoom()}`)
      }
    })
  })

/*
  const map = L.map('map', {
    center: [59.9, 10.75],
    zoom: 11,
    layers: [
      L.tileLayer('http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png')
    ]
  })
  
  console.log(homesLink)
  
  const numberformat = Intl.NumberFormat('no-NB', { maximumSignificantDigits: 2 })
  const asPrice = (str: string) => numberformat.format(Number(str)) + ' kr'
  const asM2 = (str: string) => numberformat.format(Number(str)) + ' m²'
  
  d3.csv(homesLink).then(data => {
    const scale = d3.scaleLog()
      .domain([15_000,150_000])
      .range([0, 1])

    const noOffices = (x: any) => x['Boligtype'] !== 'Kontor'
  
    data
      .filter(noOffices)
      .forEach(home => {
        const lat = Number(home.lat)
        const lng = Number(home.lng)
        const priceyness = Number(home.price_per_m2)
        
        const x = scale(priceyness)
        L.circle([lat, lng], { color: colorScheme(x), radius: 50 })
          .addTo(map)
          .bindPopup(`<h2>${home['Boligtype']} ${asM2(home.area)} (${asPrice(home.price)})</h2><p>(Per m²: ${asPrice(home.price_per_m2)})</p><a href="${home.url}">${home.url}</a>`)
      })
  })*/
}

