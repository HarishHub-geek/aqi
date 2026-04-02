-- AQI Platform Database Initialization

CREATE EXTENSION IF NOT EXISTS postgis;

-- Cities table
CREATE TABLE IF NOT EXISTS cities (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    lat DOUBLE PRECISION NOT NULL,
    lon DOUBLE PRECISION NOT NULL,
    population INTEGER,
    geom GEOMETRY(Point, 4326),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AQI measurements
CREATE TABLE IF NOT EXISTS aqi_measurements (
    id SERIAL PRIMARY KEY,
    city_id VARCHAR(50) REFERENCES cities(id),
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    aqi INTEGER NOT NULL,
    category VARCHAR(50),
    dominant_pollutant VARCHAR(10),
    pm25 REAL,
    pm10 REAL,
    no2 REAL,
    so2 REAL,
    co REAL,
    o3 REAL,
    temperature REAL,
    humidity REAL,
    wind_speed REAL,
    wind_direction REAL,
    pressure REAL,
    data_source VARCHAR(50) DEFAULT 'openaq',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Forecasts
CREATE TABLE IF NOT EXISTS forecasts (
    id SERIAL PRIMARY KEY,
    city_id VARCHAR(50) REFERENCES cities(id),
    forecast_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    aqi_predicted INTEGER NOT NULL,
    category VARCHAR(50),
    confidence REAL,
    model VARCHAR(50) DEFAULT 'ensemble',
    pm25 REAL,
    pm10 REAL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_measurements_city_time ON aqi_measurements(city_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_measurements_timestamp ON aqi_measurements(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_forecasts_city_time ON forecasts(city_id, forecast_timestamp);
CREATE INDEX IF NOT EXISTS idx_cities_geom ON cities USING GIST(geom);

-- Insert Indian cities
INSERT INTO cities (id, name, state, lat, lon, population, geom) VALUES
    ('delhi', 'Delhi', 'Delhi', 28.6139, 77.2090, 32941000, ST_SetSRID(ST_MakePoint(77.2090, 28.6139), 4326)),
    ('mumbai', 'Mumbai', 'Maharashtra', 19.0760, 72.8777, 21297000, ST_SetSRID(ST_MakePoint(72.8777, 19.0760), 4326)),
    ('kolkata', 'Kolkata', 'West Bengal', 22.5726, 88.3639, 15134000, ST_SetSRID(ST_MakePoint(88.3639, 22.5726), 4326)),
    ('chennai', 'Chennai', 'Tamil Nadu', 13.0827, 80.2707, 11235000, ST_SetSRID(ST_MakePoint(80.2707, 13.0827), 4326)),
    ('bangalore', 'Bengaluru', 'Karnataka', 12.9716, 77.5946, 13193000, ST_SetSRID(ST_MakePoint(77.5946, 12.9716), 4326)),
    ('hyderabad', 'Hyderabad', 'Telangana', 17.3850, 78.4867, 10534000, ST_SetSRID(ST_MakePoint(78.4867, 17.3850), 4326)),
    ('ahmedabad', 'Ahmedabad', 'Gujarat', 23.0225, 72.5714, 8450000, ST_SetSRID(ST_MakePoint(72.5714, 23.0225), 4326)),
    ('pune', 'Pune', 'Maharashtra', 18.5204, 73.8567, 7764000, ST_SetSRID(ST_MakePoint(73.8567, 18.5204), 4326)),
    ('jaipur', 'Jaipur', 'Rajasthan', 26.9124, 75.7873, 3917000, ST_SetSRID(ST_MakePoint(75.7873, 26.9124), 4326)),
    ('lucknow', 'Lucknow', 'Uttar Pradesh', 26.8467, 80.9462, 3700000, ST_SetSRID(ST_MakePoint(80.9462, 26.8467), 4326)),
    ('kanpur', 'Kanpur', 'Uttar Pradesh', 26.4499, 80.3319, 3200000, ST_SetSRID(ST_MakePoint(80.3319, 26.4499), 4326)),
    ('nagpur', 'Nagpur', 'Maharashtra', 21.1458, 79.0882, 2900000, ST_SetSRID(ST_MakePoint(79.0882, 21.1458), 4326)),
    ('patna', 'Patna', 'Bihar', 25.6093, 85.1376, 2700000, ST_SetSRID(ST_MakePoint(85.1376, 25.6093), 4326)),
    ('indore', 'Indore', 'Madhya Pradesh', 22.7196, 75.8577, 2500000, ST_SetSRID(ST_MakePoint(75.8577, 22.7196), 4326)),
    ('bhopal', 'Bhopal', 'Madhya Pradesh', 23.2599, 77.4126, 2300000, ST_SetSRID(ST_MakePoint(77.4126, 23.2599), 4326)),
    ('visakhapatnam', 'Visakhapatnam', 'Andhra Pradesh', 17.6868, 83.2185, 2100000, ST_SetSRID(ST_MakePoint(83.2185, 17.6868), 4326)),
    ('vadodara', 'Vadodara', 'Gujarat', 22.3072, 73.1812, 2100000, ST_SetSRID(ST_MakePoint(73.1812, 22.3072), 4326)),
    ('guwahati', 'Guwahati', 'Assam', 26.1445, 91.7362, 1100000, ST_SetSRID(ST_MakePoint(91.7362, 26.1445), 4326)),
    ('chandigarh', 'Chandigarh', 'Chandigarh', 30.7333, 76.7794, 1100000, ST_SetSRID(ST_MakePoint(76.7794, 30.7333), 4326)),
    ('thiruvananthapuram', 'Thiruvananthapuram', 'Kerala', 8.5241, 76.9366, 950000, ST_SetSRID(ST_MakePoint(76.9366, 8.5241), 4326))
ON CONFLICT (id) DO NOTHING;
