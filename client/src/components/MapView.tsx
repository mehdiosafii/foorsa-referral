import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Users, Globe } from 'lucide-react';

// Fix for default marker icons in Leaflet with Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom marker icon with brand color
const createCustomIcon = (color: string = '#EACA91') => {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      background-color: ${color};
      width: 24px;
      height: 24px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  });
};

interface ClickData {
  id: string;
  latitude: string | null;
  longitude: string | null;
  country: string | null;
  countryCode: string | null;
  city: string | null;
  region: string | null;
  createdAt: string | null;
  userName?: string;
}

interface MapViewProps {
  clicks: ClickData[];
  title?: string;
  showAmbassadorName?: boolean;
  isLoading?: boolean;
}

function MapController({ clicks }: { clicks: ClickData[] }) {
  const map = useMap();
  
  useEffect(() => {
    if (clicks.length > 0) {
      const validClicks = clicks.filter(c => c.latitude && c.longitude);
      if (validClicks.length > 0) {
        const bounds = L.latLngBounds(
          validClicks.map(c => [parseFloat(c.latitude!), parseFloat(c.longitude!)] as [number, number])
        );
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 6 });
      }
    }
  }, [clicks, map]);
  
  return null;
}

export function MapView({ clicks, title = "Visitor Map", showAmbassadorName = false, isLoading = false }: MapViewProps) {
  const customIcon = createCustomIcon();
  
  // Group clicks by country for stats
  const countryStats = clicks.reduce((acc, click) => {
    if (click.country) {
      acc[click.country] = (acc[click.country] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);
  
  const sortedCountries = Object.entries(countryStats)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const validClicks = clicks.filter(c => c.latitude && c.longitude);

  return (
    <Card className="overflow-hidden" data-testid="card-map-view">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Globe className="h-5 w-5 text-primary" />
            {title}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {validClicks.length} locations
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {Object.keys(countryStats).length} countries
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="h-[400px] flex items-center justify-center bg-muted/20">
            <div className="text-muted-foreground">Loading map data...</div>
          </div>
        ) : validClicks.length === 0 ? (
          <div className="h-[400px] flex flex-col items-center justify-center bg-muted/20 gap-3">
            <Globe className="h-12 w-12 text-muted-foreground/50" />
            <p className="text-muted-foreground text-sm">No location data available yet</p>
            <p className="text-muted-foreground/70 text-xs">Visitor locations will appear here as clicks are tracked</p>
          </div>
        ) : (
          <div className="relative">
            <div className="h-[400px] w-full">
              <MapContainer
                center={[31.7917, -7.0926]} // Morocco center
                zoom={3}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={true}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapController clicks={validClicks} />
                {validClicks.map((click) => (
                  <Marker
                    key={click.id}
                    position={[parseFloat(click.latitude!), parseFloat(click.longitude!)]}
                    icon={customIcon}
                  >
                    <Popup>
                      <div className="text-sm">
                        <div className="font-semibold mb-1">
                          {click.city ? `${click.city}, ` : ''}{click.country || 'Unknown'}
                        </div>
                        {showAmbassadorName && click.userName && (
                          <div className="text-xs text-muted-foreground mb-1">
                            Ambassador: {click.userName}
                          </div>
                        )}
                        {click.createdAt && (
                          <div className="text-xs text-muted-foreground">
                            {new Date(click.createdAt).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
            
            {/* Country stats overlay */}
            {sortedCountries.length > 0 && (
              <div className="absolute bottom-4 left-4 bg-card/95 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-border/50 z-[1000]">
                <div className="text-xs font-medium mb-2 text-muted-foreground">Top Countries</div>
                <div className="space-y-1">
                  {sortedCountries.map(([country, count]) => (
                    <div key={country} className="flex items-center justify-between gap-4 text-sm">
                      <span>{country}</span>
                      <Badge variant="secondary" className="text-xs">{count}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
