'use client';

import React from 'react';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import { scaleLinear } from 'd3-scale';

const geoUrl = "https://raw.githubusercontent.com/deldersveld/topojson/master/countries/mexico/mexico-states.json";

export const AdminMap = ({ data }: { data: { state: string, count: number }[] }) => {
  // Configurar escala de color desde volcánico hasta turquesa neón
  const colorScale = scaleLinear<string>()
    .domain([0, Math.max(...data.map(d => d.count), 1)])
    .range(["#1e293b", "#00f2fe"]);

  const getHeatColor = (stateName: string) => {
    // Normalizar nombres de estado para emparejar
    const d = data.find(s => s.state.toLowerCase().includes(stateName.toLowerCase()));
    return d ? colorScale(d.count) : "#1e293b"; // volcanic-800 default
  };

  return (
    <div className="w-full h-full min-h-[400px] flex items-center justify-center bg-volcanic-900 rounded-3xl border border-white/5 p-4 shadow-glass">
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          scale: 1200,
          center: [-102, 24] // Coordenadas centrales de México
        }}
        className="w-full h-full max-h-[500px]"
      >
        <Geographies geography={geoUrl}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const stateName = geo.properties.NAME_1; // Nombre del estado en el TopoJSON
              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={getHeatColor(stateName)}
                  stroke="#FDE047" // Borde en oro pálido
                  strokeWidth={0.5}
                  style={{
                    default: { outline: "none" },
                    hover: { fill: "#FDE047", outline: "none", transition: "all 250ms" },
                    pressed: { outline: "none" },
                  }}
                />
              );
            })
          }
        </Geographies>
      </ComposableMap>
    </div>
  );
};
