import { useEffect, useRef, useState } from 'react';
import * as Cesium from 'cesium';

export default function GlobeView() {
  const cesiumContainer = useRef(null);
  const [objects, setObjects] = useState([]);

  useEffect(() => {
    if (cesiumContainer.current) {
      const viewer = new Cesium.Viewer(cesiumContainer.current, {
        timeline: false,
        animation: false,
        baseLayerPicker: false,
        geocoder: false,
        homeButton: false,
        infoBox: false,
        sceneModePicker: false,
        selectionIndicator: false,
        fullscreenButton: false
      });

      // Add sample debris objects
      const sampleObjects = [
        { id: 1, name: 'ISS (ZARYA)', lon: -45, lat: 28, alt: 420, color: Cesium.Color.CYAN },
        { id: 2, name: 'DEBRISB-4421', lon: 120, lat: 15, alt: 780, color: Cesium.Color.RED },
        { id: 3, name: 'SAT-ALEPH', lon: -100, lat: 45, alt: 1200, color: Cesium.Color.YELLOW },
        { id: 4, name: 'ROCKET-BODY-09', lon: 30, lat: -20, alt: 550, color: Cesium.Color.ORANGE },
      ];

      sampleObjects.forEach((obj) => {
        viewer.entities.add({
          id: obj.id,
          name: obj.name,
          position: Cesium.Cartesian3.fromDegrees(obj.lon, obj.lat, obj.alt * 1000),
          billboard: {
            image: obj.color === Cesium.Color.RED ? 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSI4IiBjeT0iOCIgcj0iNyIgZmlsbD0iI2ZmNDQ0NCIvPjwvc3ZnPg==' : undefined,
            color: obj.color
          },
          label: { text: obj.name, font: '14pt sans-serif', fillColor: Cesium.Color.WHITE, style: Cesium.LabelStyle.FILL_AND_OUTLINE }
        });
      });

      setObjects(sampleObjects);
    }
  }, []);

  if (!cesiumContainer.current) return <div ref={cesiumContainer} className="w-full h-full" />;

  return <div ref={cesiumContainer} className="w-full h-full" />;
}
