import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import MapView from './Components/MapView'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <h1>NutriMap</h1>
      <h3>Census tract food desert forecasting, classification, and analysis done by machine learning</h3>
      <MapView></MapView>
    </>
  )
}

export default App
