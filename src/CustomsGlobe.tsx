import React, { useEffect, useRef, useState } from 'react';
import Globe from 'react-globe.gl';
import { feature, FeatureCollection } from 'topojson-client';
import * as d3 from 'd3';
import worldDataRaw from './world-110m.json';

interface CountryFeature {
  type: string;
  properties: {
    ADMIN: string;
  };
  geometry: {
    type: string;
    coordinates: any;
  };
}

export default function CustomsGlobe() {
  const globeEl = useRef<any>(null);
  const [countries, setCountries] = useState<FeatureCollection<any> | null>(
    null
  );

  useEffect(() => {
    const worldTopo: any = worldDataRaw;
    const geoData: FeatureCollection<any> = feature(
      worldTopo,
      worldTopo.objects.countries
    );
    setCountries(geoData);
  }, []);

  useEffect(() => {
    if (!globeEl.current) return;

    const interval = setInterval(() => {
      const now = new Date();
      const kstOffset = 9 * 60;
      const utc = now.getTime() + now.getTimezoneOffset() * 60000;
      const kst = new Date(utc + 60000 * kstOffset);

      const secondsInDay = 24 * 60 * 60;
      const secondsNow =
        kst.getUTCHours() * 3600 +
        kst.getUTCMinutes() * 60 +
        kst.getUTCSeconds();
      const angle = (secondsNow / secondsInDay) * 360;

      globeEl.current.controls().autoRotate = true;
      globeEl.current.controls().autoRotateSpeed = 0.5;
      globeEl.current.pointOfView(
        { lat: 0, lng: angle - 180, altitude: 2 },
        100
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ width: '100%', height: '100vh' }}>
      {countries && (
        <Globe
          ref={globeEl}
          globeImageUrl="//unpkg.com/three-globe/example/img/earth-dark.jpg"
          backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
          showAtmosphere={true}
          atmosphereColor="lightskyblue"
          atmosphereAltitude={0.15}
          polygonsData={countries.features}
          polygonCapColor={() => 'rgba(255, 255, 255, 0.1)'}
          polygonSideColor={() => 'rgba(0, 100, 255, 0.15)'}
          polygonStrokeColor={() => '#111'}
          polygonLabel={({ properties }: any) => `${properties.ADMIN}`}
        />
      )}
    </div>
  );
}
