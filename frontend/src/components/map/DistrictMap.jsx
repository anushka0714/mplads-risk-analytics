import { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, AlertTriangle, CheckCircle } from 'lucide-react';
import { formatCrores, formatPercent } from '../../utils/formatters';

// Custom clean DivIcon that doesn't rely on Leaflet's missing PNG assets
const createDistrictIcon = (flagsCount) => {
  const isHighFlag = flagsCount > 15;
  const bgColor = isHighFlag ? 'bg-rose-600' : 'bg-sky-600';
  const ringColor = isHighFlag ? 'ring-rose-200' : 'ring-sky-200';

  return L.divIcon({
    className: 'custom-map-pin',
    html: `
      <div class="relative flex items-center justify-center">
        <div class="w-8 h-8 rounded-full ${bgColor} text-white font-bold text-xs flex items-center justify-center shadow-lg ring-4 ${ringColor}">
          ${flagsCount > 0 ? flagsCount : '✓'}
        </div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -18],
  });
};

export default function DistrictMap({ districts, onSelectDistrict }) {
  const [filterMode, setFilterMode] = useState('all'); // 'all', 'flagged', 'high-utilization'

  const filteredDistricts = districts.filter((d) => {
    if (filterMode === 'flagged') return d.flagsCount > 10;
    if (filterMode === 'high-utilization') return d.utilizationRate >= 80;
    return true;
  });

  // Center coordinate around representative Indian state (Madhya Pradesh)
  const mapCenter = [23.85, 78.50];

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col">
      {/* Map Control Bar */}
      <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-50/50">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-sky-600" />
            District-Level Spatial Monitoring
          </h3>
          <p className="text-xs text-slate-500">
            Click pins to inspect fund utilization and audit flags by administrative jurisdiction
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-white p-1 rounded-lg border border-slate-200 text-xs">
          <button
            type="button"
            onClick={() => setFilterMode('all')}
            className={`px-3 py-1 rounded-md transition-colors ${
              filterMode === 'all'
                ? 'bg-sky-50 text-sky-700 font-semibold border border-sky-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Districts ({districts.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterMode('flagged')}
            className={`px-3 py-1 rounded-md transition-colors flex items-center gap-1 ${
              filterMode === 'flagged'
                ? 'bg-rose-50 text-rose-700 font-semibold border border-rose-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <AlertTriangle className="w-3 h-3 text-rose-600" />
            High Flags
          </button>
          <button
            type="button"
            onClick={() => setFilterMode('high-utilization')}
            className={`px-3 py-1 rounded-md transition-colors flex items-center gap-1 ${
              filterMode === 'high-utilization'
                ? 'bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CheckCircle className="w-3 h-3 text-emerald-600" />
            &gt; 80% Utilization
          </button>
        </div>
      </div>

      {/* Map Container */}
      <div className="h-[450px] w-full relative z-10">
        <MapContainer
          center={mapCenter}
          zoom={7}
          scrollWheelZoom={false}
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {filteredDistricts.map((district) => (
            <Marker
              key={district.id}
              position={[district.lat, district.lng]}
              icon={createDistrictIcon(district.flagsCount)}
            >
              <Popup>
                <div className="p-1 min-w-[200px] text-xs font-sans">
                  <div className="border-b border-slate-200 pb-1.5 mb-2">
                    <h4 className="font-bold text-slate-900 text-sm">{district.name}</h4>
                    <span className="text-[10px] text-slate-500">{district.state}</span>
                  </div>

                  <div className="space-y-1.5 text-slate-600">
                    <div className="flex justify-between">
                      <span>Total Works:</span>
                      <strong className="text-slate-800">{district.totalWorks}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Sanctioned:</span>
                      <strong className="text-slate-800">{formatCrores(district.sanctionedCr)}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Expended:</span>
                      <strong className="text-slate-800">{formatCrores(district.expenditureCr)}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Utilization Rate:</span>
                      <strong className="text-emerald-700">{formatPercent(district.utilizationRate)}</strong>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-slate-100">
                      <span className="text-rose-600 font-medium">Review Triggers:</span>
                      <span className="px-1.5 py-0.2 bg-rose-100 text-rose-700 rounded font-bold">
                        {district.flagsCount}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onSelectDistrict && onSelectDistrict(district)}
                    className="w-full mt-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded font-medium text-center transition-colors"
                  >
                    View District Register
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Map Legend Footer */}
      <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 text-xs flex flex-wrap items-center justify-between gap-3 text-slate-600">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-sky-600 inline-block" />
            Standard Pin (Works active)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-600 inline-block" />
            High Outlier Count (&gt; 15 review flags)
          </span>
        </div>
        <div className="text-slate-400 italic">
          Coordinate points represent administrative district headquarters
        </div>
      </div>
    </div>
  );
}
