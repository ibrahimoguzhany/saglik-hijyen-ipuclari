'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';

const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
) as any;
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
) as any;
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
) as any;
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
) as any;

interface EmergencyLocation {
  name: string;
  type: 'hospital' | 'pharmacy';
  address: string;
  phone: string;
  distance?: string;
  isOpen?: boolean;
  position: {
    lat: number;
    lng: number;
  };
  district: string;
}

const emergencyLocations: EmergencyLocation[] = [
  {
    name: 'Acıbadem Hastanesi',
    type: 'hospital',
    address: 'Teşvikiye, Güzelbahçe Sk. No:20, 34365 Şişli/İstanbul',
    phone: '0212 304 4444',
    position: {
      lat: 41.0478,
      lng: 28.9952
    },
    district: 'Şişli'
  },
  {
    name: 'Şişli Hamidiye Etfal Eğitim ve Araştırma Hastanesi',
    type: 'hospital',
    address: 'Halaskargazi Cd. Etfal Sk. 34371 Şişli/İstanbul',
    phone: '0212 373 5000',
    position: {
      lat: 41.0524,
      lng: 28.9872
    },
    district: 'Şişli'
  },
  {
    name: 'Amerikan Hastanesi',
    type: 'hospital',
    address: 'Güzelbahçe Sk. No:20, Nişantaşı, Şişli/İstanbul',
    phone: '0212 444 3777',
    position: {
      lat: 41.0484,
      lng: 28.9947
    },
    district: 'Şişli'
  },
  {
    name: 'Teşvikiye Eczanesi',
    type: 'pharmacy',
    address: 'Teşvikiye, Hüsrev Gerede Cd. No:95, 34365 Şişli/İstanbul',
    phone: '0212 246 0052',
    isOpen: true,
    position: {
      lat: 41.0486,
      lng: 28.9943
    },
    district: 'Şişli'
  },
  {
    name: 'Şişli Eczanesi',
    type: 'pharmacy',
    address: 'Meşrutiyet, Rumeli Cd. No:68, 34363 Şişli/İstanbul',
    phone: '0212 219 5370',
    isOpen: true,
    position: {
      lat: 41.0447,
      lng: 28.9912
    },
    district: 'Şişli'
  },
  {
    name: 'Fulya Eczanesi',
    type: 'pharmacy',
    address: 'Fulya Mah. Mehmetçik Cad. No:42/A Şişli/İstanbul',
    phone: '0212 275 1355',
    isOpen: true,
    position: {
      lat: 41.0527,
      lng: 28.9897
    },
    district: 'Şişli'
  },
  {
    name: 'Florence Nightingale Hastanesi',
    type: 'hospital',
    address: 'Abide-i Hürriyet Cd. No:166, 34381 Şişli/İstanbul',
    phone: '0212 224 4950',
    position: {
      lat: 41.0631,
      lng: 28.9827
    },
    district: 'Şişli'
  }
];

const firstAidSteps = [
  {
    title: 'Temel Yaşam Desteği (CPR)',
    content: `1. Bilinç kontrolü yapın
2. Yardım çağırın (112)
3. Solunum kontrolü yapın
4. 30 kalp masajı uygulayın
5. 2 suni solunum yapın
6. Profesyonel yardım gelene kadar devam edin`,
    image: 'https://picsum.photos/seed/cpr/400/300'
  },
  {
    title: 'Kanama Kontrolü',
    content: `1. Temiz bir bez ile baskı uygulayın
2. Yaralı bölgeyi kalp seviyesinden yukarıda tutun
3. Direkt baskı ile kanama durmazsa turnike uygulayın
4. Tıbbi yardım alın`,
    image: 'https://picsum.photos/seed/bleeding/400/300'
  },
  {
    title: 'Yanık Müdahalesi',
    content: `1. Yanık bölgeyi soğuk su altında tutun
2. En az 10 dakika suyla soğutun
3. Yanık üzerine buz koymayın
4. Steril pansuman uygulayın
5. Ciddi yanıklarda 112'yi arayın`,
    image: 'https://picsum.photos/seed/burn/400/300'
  }
];

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Dünya'nın yarıçapı (km)
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

export default function EmergencyPage() {
  const [selectedTab, setSelectedTab] = useState<'map' | 'firstaid' | 'pharmacy'>('map');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [searchAddress, setSearchAddress] = useState('');
  const [sortedLocations, setSortedLocations] = useState<EmergencyLocation[]>([]);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mapKey, setMapKey] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      setIsLoading(true);
      setError(null);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userPos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(userPos);
          setMapCenter(userPos);
          updateLocationDistances(userPos);
          setMapKey(prev => prev + 1);
          setIsLoading(false);
        },
        (error) => {
          console.error('Konum alınamadı:', error);
          setError('Konumunuz alınamadı. Lütfen adres araması yapın.');
          setIsLoading(false);
          const defaultPos = { lat: 41.0527, lng: 28.9897 };
          setMapCenter(defaultPos);
          updateLocationDistances(defaultPos);
        }
      );
    }
  }, []);

  const updateLocationDistances = (centerPos: { lat: number; lng: number }) => {
    const locationsWithDistance = emergencyLocations.map(location => {
      const distance = calculateDistance(
        centerPos.lat,
        centerPos.lng,
        location.position.lat,
        location.position.lng
      );
      return {
        ...location,
        distance: `${distance.toFixed(1)} km`
      };
    });

    const sorted = locationsWithDistance
      .filter(loc => parseFloat((loc.distance || '0').replace(' km', '')) <= 10)
      .sort((a, b) => {
        const distA = parseFloat((a.distance || '0').replace(' km', ''));
        const distB = parseFloat((b.distance || '0').replace(' km', ''));
        return distA - distB;
      });

    setSortedLocations(sorted);
  };

  const handleLocationSearch = async () => {
    if (!searchAddress) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchAddress + ', İstanbul')}`
      );
      const data = await response.json();

      if (data && data[0]) {
        const newPos = {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon)
        };
        setMapCenter(newPos);
        updateLocationDistances(newPos);
        setMapKey(prev => prev + 1);
      } else {
        setError('Adres bulunamadı. Lütfen başka bir adres deneyin.');
      }
    } catch (error) {
      console.error('Adres araması başarısız:', error);
      setError('Adres araması başarısız. Lütfen tekrar deneyin.');
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Acil Durum Asistanı</h1>
            <p className="mt-2 text-gray-600">
              En yakın sağlık kuruluşlarını bulun, nöbetçi eczaneleri görüntüleyin ve ilk yardım rehberine ulaşın.
            </p>
            {error && (
              <div className="mt-2 text-sm text-red-600 bg-red-50 rounded-md p-2">
                {error}
              </div>
            )}
          </div>

          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setSelectedTab('map')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  selectedTab === 'map'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                🏥 Sağlık Kuruluşları
              </button>
              <button
                onClick={() => setSelectedTab('pharmacy')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  selectedTab === 'pharmacy'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                💊 Nöbetçi Eczaneler
              </button>
              <button
                onClick={() => setSelectedTab('firstaid')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  selectedTab === 'firstaid'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                🚑 İlk Yardım Rehberi
              </button>
            </nav>
          </div>

          {selectedTab !== 'firstaid' && (
            <div className="mb-6">
              <div className="flex gap-4">
                <input
                  type="text"
                  placeholder="Adresinizi girin..."
                  value={searchAddress}
                  onChange={(e) => setSearchAddress(e.target.value)}
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-gray-900 font-medium placeholder-gray-600"
                  onKeyPress={(e) => e.key === 'Enter' && handleLocationSearch()}
                />
                <button
                  onClick={handleLocationSearch}
                  disabled={isLoading}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400"
                >
                  {isLoading ? 'Aranıyor...' : 'Ara'}
                </button>
              </div>
              <p className="mt-2 text-sm text-gray-500">
                {userLocation ? '📍 Konumunuz alındı' : 'Konumunuz alınamadı'}
                {sortedLocations.length > 0 && ` • ${sortedLocations.length} sağlık kuruluşu bulundu (10km yarıçapında)`}
              </p>
            </div>
          )}

          <div className="bg-white rounded-lg shadow">
            {selectedTab === 'map' && (
              <div className="p-6">
                <div className="mb-6 h-[400px] rounded-lg overflow-hidden">
                  {mapCenter && (
                    <MapContainer
                      key={mapKey}
                      center={[mapCenter.lat, mapCenter.lng]}
                      zoom={14}
                      style={{ height: '100%', width: '100%' }}
                    >
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      />
                      {userLocation && (
                        <Marker position={[userLocation.lat, userLocation.lng]}>
                          <Popup>📍 Konumunuz</Popup>
                        </Marker>
                      )}
                      {sortedLocations
                        .filter(location => location.type === 'hospital')
                        .map((location, index) => (
                          <Marker
                            key={index}
                            position={[location.position.lat, location.position.lng]}
                          >
                            <Popup>
                              <div className="font-medium">{location.name}</div>
                              <div className="text-sm">{location.address}</div>
                              <div className="text-sm">{location.phone}</div>
                              <div className="text-sm font-medium text-blue-600 mt-1">
                                {location.distance}
                              </div>
                            </Popup>
                          </Marker>
                        ))}
                    </MapContainer>
                  )}
                </div>
                <div className="space-y-4">
                  {sortedLocations
                    .filter(location => location.type === 'hospital')
                    .map((location, index) => (
                      <div key={index} className="flex justify-between items-center p-4 border rounded-lg hover:bg-gray-50">
                        <div>
                          <h3 className="font-medium text-gray-900">{location.name}</h3>
                          <p className="text-sm text-gray-500">{location.address}</p>
                          <p className="text-sm text-gray-500">{location.phone}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-medium text-blue-600">{location.distance}</span>
                          <a
                            href={`tel:${location.phone}`}
                            className="block mt-2 text-blue-600 hover:text-blue-800"
                          >
                            Ara
                          </a>
                        </div>
                      </div>
                    ))}
                  {sortedLocations.filter(location => location.type === 'hospital').length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      Bu bölgede hastane bulunamadı. Lütfen başka bir adres deneyin.
                    </div>
                  )}
                </div>
              </div>
            )}

            {selectedTab === 'pharmacy' && (
              <div className="p-6">
                <div className="space-y-4">
                  {sortedLocations
                    .filter(location => location.type === 'pharmacy')
                    .map((location, index) => (
                      <div key={index} className="flex justify-between items-center p-4 border rounded-lg hover:bg-gray-50">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-gray-900">{location.name}</h3>
                            {location.isOpen && (
                              <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                                Nöbetçi
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500">{location.address}</p>
                          <p className="text-sm text-gray-500">{location.phone}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-medium text-blue-600">{location.distance}</span>
                          <a
                            href={`tel:${location.phone}`}
                            className="block mt-2 text-blue-600 hover:text-blue-800"
                          >
                            Ara
                          </a>
                        </div>
                      </div>
                    ))}
                  {sortedLocations.filter(location => location.type === 'pharmacy').length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      Bu bölgede nöbetçi eczane bulunamadı. Lütfen başka bir adres deneyin.
                    </div>
                  )}
                </div>
              </div>
            )}

            {selectedTab === 'firstaid' && (
              <div className="p-6">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {firstAidSteps.map((step, index) => (
                    <div key={index} className="border rounded-lg overflow-hidden">
                      <div className="relative h-48">
                        <Image
                          src={step.image}
                          alt={step.title}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="font-bold text-lg text-gray-900 mb-2">{step.title}</h3>
                        <p className="text-gray-700 whitespace-pre-line">{step.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
} 