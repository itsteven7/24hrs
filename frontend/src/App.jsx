import React, { useState, useEffect, useRef } from 'react';
import MapComponent from './components/MapComponent';
import { calculateDistance } from './utils/distance';
import './App.css';

const AMBULANCE_START = [28.552413, 77.131123];

function App() {
  const [route, setRoute] = useState(null);
  const [dronePosition, setDronePosition] = useState(null);
  const [isDroneActive, setIsDroneActive] = useState(false);
  const [batteryLevel, setBatteryLevel] = useState(100);
  const [droneDistance, setDroneDistance] = useState(0);
  // eslint-disable-next-line no-unused-vars
  const [droneIndex, setDroneIndex] = useState(0);

  const simulationRef = useRef(null);

  const handleRouteCalculated = (calculatedRoute) => {
    setRoute(calculatedRoute);
    // Reset drone state when new route is calculated
    stopSimulation();
    setDronePosition(null);
    setDroneIndex(0);
    setBatteryLevel(100);
    setDroneDistance(0);
  };

  const startSimulation = () => {
    if (!route || route.length === 0) return;
    setIsDroneActive(true);
    setDronePosition(route[0]);
    setDroneIndex(0);
  };

  const stopSimulation = () => {
    setIsDroneActive(false);
    if (simulationRef.current) {
        clearInterval(simulationRef.current);
        simulationRef.current = null;
    }
  };

  useEffect(() => {
    if (isDroneActive && route) {
        simulationRef.current = setInterval(() => {
            setDroneIndex(prevIndex => {
                const nextIndex = prevIndex + 1;
                if (nextIndex >= route.length) {
                    stopSimulation();
                    return prevIndex;
                }

                const newPos = route[nextIndex];
                setDronePosition(newPos);

                // Calculate distance from ambulance (start)
                const dist = calculateDistance(
                    AMBULANCE_START[0], AMBULANCE_START[1],
                    newPos[0], newPos[1]
                );
                setDroneDistance(dist);

                // Decrease battery based on distance or time
                setBatteryLevel(prev => Math.max(0, prev - 0.05));

                return nextIndex;
            });
        }, 50); // Update every 50ms for smoother/faster animation
    }

    return () => {
        if (simulationRef.current) clearInterval(simulationRef.current);
    };
  }, [isDroneActive, route]);

  return (
    <div className="app-container">
      <div className="sidebar">
        <h1>Ambulance Drone System</h1>

        <div className="control-panel">
            {!route && <p>Select a hospital on the map to calculate route.</p>}

            {route && (
                <div className="drone-controls">
                    <h2>Drone Status</h2>
                    <p><strong>Battery:</strong> <span style={{color: batteryLevel < 20 ? 'red' : 'green'}}>{batteryLevel.toFixed(1)}%</span></p>
                    <p><strong>Range:</strong> {droneDistance.toFixed(2)} km</p>
                    <p><strong>Status:</strong> {isDroneActive ? "Active" : "Ready"}</p>

                    {!isDroneActive && (
                        <button className="deploy-btn" onClick={startSimulation}>
                            Deploy Drone
                        </button>
                    )}
                     {isDroneActive && (
                        <button className="stop-btn" onClick={stopSimulation}>
                            Recall Drone
                        </button>
                    )}
                </div>
            )}
        </div>
      </div>
      <div className="map-container">
        <MapComponent
            ambulanceStart={AMBULANCE_START}
            onRouteCalculated={handleRouteCalculated}
            dronePosition={dronePosition}
        />
      </div>
    </div>
  );
}

export default App;
