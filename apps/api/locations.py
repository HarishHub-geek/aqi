"""
City sub-locations / monitoring stations data.
Generates realistic station-level AQI data for each city.
"""

import random
from datetime import datetime, timedelta
from typing import Dict, List

# Real-world locality names for major Indian cities
CITY_LOCATIONS = {
    "delhi": [
        "Anand Vihar", "ITO", "Dwarka", "R K Puram", "Mandir Marg",
        "Punjabi Bagh", "Rohini", "Mundka", "Okhla", "Lodhi Road",
        "Ashok Vihar", "Siri Fort", "Patparganj", "Shadipur", "Wazirpur",
        "Najafgarh", "Vivek Vihar", "Bawana", "Narela", "Chandni Chowk",
    ],
    "mumbai": [
        "Bandra", "Worli", "Andheri", "Colaba", "Powai",
        "Malad", "Borivali", "Kurla", "Chembur", "Navi Mumbai",
        "Thane", "Mulund", "Goregaon", "Vile Parle", "Mazgaon",
    ],
    "kolkata": [
        "Park Street", "Salt Lake", "Howrah", "Jadavpur", "Ballygunge",
        "Dum Dum", "Barrackpore", "Behala", "Tollygunge", "Bidhannagar",
        "Rabindra Bharati", "Victoria Memorial", "Gariahat", "Fort William",
    ],
    "chennai": [
        "Abhiramapuram", "Abiramapuram", "Achuthan Nagar", "Alwar Nagar",
        "Annai Sathya Nagar", "Arumbakkam", "Balaji Nagar Extension",
        "Cbi Colony", "Egmore", "T Nagar", "Mylapore", "Adyar",
        "Velachery", "Guindy", "Kodambakkam", "Anna Nagar",
    ],
    "bangalore": [
        "Peenya", "BTM Layout", "Jayanagar", "Silk Board", "Hebbal",
        "Whitefield", "HSR Layout", "Koramangala", "Electronic City",
        "Marathahalli", "Indiranagar", "Rajajinagar", "Yelahanka",
    ],
    "hyderabad": [
        "Jubilee Hills", "HITEC City", "Secunderabad", "Kukatpally",
        "Gachibowli", "Miyapur", "Charminar", "Ameerpet", "LB Nagar",
        "Madhapur", "Banjara Hills", "Begumpet", "Abids",
    ],
    "ahmedabad": [
        "Maninagar", "Satellite", "Navrangpura", "Chandkheda",
        "Bopal", "Vastrapur", "Prahlad Nagar", "Ellis Bridge",
        "Paldi", "Thaltej", "SG Highway", "Gota",
    ],
    "pune": [
        "Shivaji Nagar", "Hadapsar", "Kothrud", "Hinjewadi",
        "Wakad", "Baner", "Aundh", "Viman Nagar", "Deccan",
        "Katraj", "Swargate", "Kharadi",
    ],
    "jaipur": [
        "C-Scheme", "Vaishali Nagar", "Mansarovar", "Malviya Nagar",
        "Raja Park", "Tonk Road", "Jagatpura", "Sanganer",
        "Ajmeri Gate", "Chandpole", "Hawa Mahal Road",
    ],
    "lucknow": [
        "Gomti Nagar", "Hazratganj", "Aliganj", "Indira Nagar",
        "Aminabad", "Chowk", "Mahanagar", "Rajajipuram",
        "Alambagh", "Talkatora", "LDA Colony",
    ],
    "kanpur": [
        "Civil Lines", "Swaroop Nagar", "Kidwai Nagar", "Govind Nagar",
        "Kakadeo", "Harsh Nagar", "Kalyanpur", "Panki",
    ],
    "patna": [
        "Kankarbagh", "Boring Road", "Rajendra Nagar", "Danapur",
        "Bailey Road", "Gandhi Maidan", "Patna City", "Phulwari Sharif",
    ],
    "nagpur": [
        "Sitabuldi", "Dharampeth", "Sadar", "Civil Lines",
        "Hingna", "Manewada", "Wardha Road", "Koradi",
    ],
    "indore": [
        "Vijay Nagar", "Palasia", "Rajwada", "Bhawarkuan",
        "Sapna Sangeeta", "AB Road", "Annapurna", "Rau",
    ],
    "bhopal": [
        "New Market", "Arera Colony", "MP Nagar", "Habibganj",
        "Kolar", "Shahpura", "Ayodhya Bypass", "Hoshangabad Road",
    ],
    "visakhapatnam": [
        "Beach Road", "Dwaraka Nagar", "MVP Colony", "Gajuwaka",
        "Madhurawada", "Seethammadhara", "NAD Junction", "Pendurthi",
    ],
    "vadodara": [
        "Alkapuri", "Fatehgunj", "Sayajigunj", "Gotri",
        "Manjalpur", "Vasna Road", "Sama", "Karelibaug",
    ],
    "guwahati": [
        "Pan Bazar", "Paltan Bazar", "Zoo Road", "Garchuk",
        "Beltola", "Ganeshguri", "Dispur", "Six Mile",
    ],
    "chandigarh": [
        "Sector 17", "Sector 22", "Sector 35", "Sector 43",
        "Industrial Area", "Manimajra", "Panchkula", "Mohali",
    ],
    "thiruvananthapuram": [
        "MG Road", "Kowdiar", "Pattom", "Kesavadasapuram",
        "Kazhakkoottam", "Sreekaryam", "Vellayambalam", "Thampanoor",
    ],
}


def generate_location_data(city_id: str) -> List[Dict]:
    """
    Generate realistic AQI data for all sub-locations within a city.
    Each location gets its own AQI, PM2.5, PM10, temp, humidity.
    """
    from .aqi_calculator import calculate_aqi

    locations = CITY_LOCATIONS.get(city_id, [f"Station {i+1}" for i in range(8)])

    # City baseline
    baselines = {
        "delhi": {"pm25": 180, "pm10": 250},
        "mumbai": {"pm25": 80, "pm10": 120},
        "kolkata": {"pm25": 100, "pm10": 150},
        "chennai": {"pm25": 50, "pm10": 80},
        "bangalore": {"pm25": 55, "pm10": 90},
        "hyderabad": {"pm25": 65, "pm10": 100},
        "ahmedabad": {"pm25": 90, "pm10": 140},
        "pune": {"pm25": 60, "pm10": 95},
        "jaipur": {"pm25": 95, "pm10": 160},
        "lucknow": {"pm25": 130, "pm10": 200},
        "kanpur": {"pm25": 140, "pm10": 210},
        "patna": {"pm25": 150, "pm10": 220},
        "nagpur": {"pm25": 70, "pm10": 110},
        "indore": {"pm25": 75, "pm10": 115},
        "bhopal": {"pm25": 80, "pm10": 125},
        "visakhapatnam": {"pm25": 45, "pm10": 70},
        "vadodara": {"pm25": 85, "pm10": 130},
        "guwahati": {"pm25": 55, "pm10": 85},
        "chandigarh": {"pm25": 75, "pm10": 120},
        "thiruvananthapuram": {"pm25": 30, "pm10": 50},
    }

    base = baselines.get(city_id, {"pm25": 70, "pm10": 100})

    hour = datetime.now().hour
    if 6 <= hour <= 10:
        time_factor = 1.3
    elif 17 <= hour <= 21:
        time_factor = 1.2
    elif 0 <= hour <= 5:
        time_factor = 0.8
    else:
        time_factor = 1.0

    # Base temperature varies by city latitude
    lat_map = {
        "delhi": 28.6, "mumbai": 19.1, "kolkata": 22.6, "chennai": 13.1,
        "bangalore": 13.0, "hyderabad": 17.4, "ahmedabad": 23.0,
        "pune": 18.5, "jaipur": 26.9, "lucknow": 26.8,
        "kanpur": 26.4, "patna": 25.6, "nagpur": 21.1,
        "indore": 22.7, "bhopal": 23.3, "visakhapatnam": 17.7,
        "vadodara": 22.3, "guwahati": 26.1, "chandigarh": 30.7,
        "thiruvananthapuram": 8.5,
    }
    lat = lat_map.get(city_id, 22.0)
    base_temp = round(35 - (lat - 8) * 0.4)

    result = []
    for loc_name in sorted(locations):
        # Each location gets its own variation (±30% from city baseline)
        loc_var = random.uniform(0.7, 1.3)
        pm25 = round(max(5, base["pm25"] * time_factor * loc_var * random.uniform(0.9, 1.1)), 0)
        pm10 = round(max(10, base["pm10"] * time_factor * loc_var * random.uniform(0.9, 1.1)), 0)
        no2 = round(max(5, 35 * loc_var * random.uniform(0.8, 1.2)), 0)
        so2 = round(max(2, 14 * loc_var * random.uniform(0.8, 1.2)), 0)
        co = round(max(0.3, 1.5 * loc_var * random.uniform(0.8, 1.2)), 1)
        o3 = round(max(5, 40 * loc_var * random.uniform(0.8, 1.2)), 0)

        pollutants = {"pm25": pm25, "pm10": pm10, "no2": no2, "so2": so2, "co": co, "o3": o3}
        aqi_result = calculate_aqi(pollutants)

        temp = round(base_temp + random.uniform(-2, 2))
        humidity = round(random.uniform(60, 90))

        result.append({
            "location": loc_name,
            "aqi": aqi_result["aqi"],
            "category": aqi_result["category"],
            "color": aqi_result["color"],
            "dominant_pollutant": aqi_result["dominant_pollutant"],
            "pm25": pm25,
            "pm10": pm10,
            "no2": no2,
            "so2": so2,
            "co": co,
            "o3": o3,
            "temperature": temp,
            "humidity": humidity,
        })

    # Sort by AQI descending
    result.sort(key=lambda x: x["aqi"], reverse=True)
    return result


def generate_hourly_history(city_id: str, hours: int = 24) -> Dict:
    """
    Generate hourly historical AQI data for the past N hours.
    Returns data shaped like the reference image bar chart.
    """
    from .aqi_calculator import calculate_aqi

    baselines = {
        "delhi": {"pm25": 180, "pm10": 250, "no2": 60, "so2": 20, "co": 2.5, "o3": 40},
        "mumbai": {"pm25": 80, "pm10": 120, "no2": 45, "so2": 15, "co": 1.8, "o3": 35},
        "kolkata": {"pm25": 100, "pm10": 150, "no2": 50, "so2": 18, "co": 2.0, "o3": 38},
        "chennai": {"pm25": 50, "pm10": 80, "no2": 30, "so2": 10, "co": 1.2, "o3": 45},
        "bangalore": {"pm25": 55, "pm10": 90, "no2": 35, "so2": 12, "co": 1.3, "o3": 42},
        "hyderabad": {"pm25": 65, "pm10": 100, "no2": 38, "so2": 14, "co": 1.5, "o3": 40},
        "ahmedabad": {"pm25": 90, "pm10": 140, "no2": 42, "so2": 16, "co": 1.7, "o3": 38},
        "pune": {"pm25": 60, "pm10": 95, "no2": 32, "so2": 11, "co": 1.3, "o3": 43},
        "jaipur": {"pm25": 95, "pm10": 160, "no2": 40, "so2": 15, "co": 1.6, "o3": 36},
        "lucknow": {"pm25": 130, "pm10": 200, "no2": 55, "so2": 22, "co": 2.2, "o3": 35},
        "kanpur": {"pm25": 140, "pm10": 210, "no2": 58, "so2": 25, "co": 2.3, "o3": 33},
        "patna": {"pm25": 150, "pm10": 220, "no2": 52, "so2": 20, "co": 2.4, "o3": 32},
        "nagpur": {"pm25": 70, "pm10": 110, "no2": 35, "so2": 13, "co": 1.4, "o3": 41},
        "indore": {"pm25": 75, "pm10": 115, "no2": 36, "so2": 14, "co": 1.5, "o3": 40},
        "bhopal": {"pm25": 80, "pm10": 125, "no2": 38, "so2": 15, "co": 1.6, "o3": 39},
        "visakhapatnam": {"pm25": 45, "pm10": 70, "no2": 28, "so2": 10, "co": 1.1, "o3": 46},
        "vadodara": {"pm25": 85, "pm10": 130, "no2": 40, "so2": 16, "co": 1.7, "o3": 37},
        "guwahati": {"pm25": 55, "pm10": 85, "no2": 30, "so2": 11, "co": 1.2, "o3": 44},
        "chandigarh": {"pm25": 75, "pm10": 120, "no2": 38, "so2": 14, "co": 1.5, "o3": 41},
        "thiruvananthapuram": {"pm25": 30, "pm10": 50, "no2": 20, "so2": 8, "co": 0.8, "o3": 48},
    }

    baseline = baselines.get(city_id, {"pm25": 70, "pm10": 100, "no2": 35, "so2": 14, "co": 1.5, "o3": 40})
    now = datetime.utcnow()
    data_points = []

    # Use a fixed random seed per city+date so values are stable within the same hour
    seed = hash(city_id + now.strftime("%Y-%m-%d-%H"))
    rng = random.Random(seed)

    for i in range(hours, 0, -1):
        ts = now.replace(minute=0, second=0, microsecond=0) - timedelta(hours=i - 1)
        hour = ts.hour

        # Time-of-day factor
        if 6 <= hour <= 10:
            factor = 1.3
        elif 17 <= hour <= 21:
            factor = 1.2
        elif 0 <= hour <= 5:
            factor = 0.8
        else:
            factor = 1.0

        pollutants = {}
        for key, base_val in baseline.items():
            variation = rng.uniform(0.75, 1.25)
            pollutants[key] = round(max(1, base_val * factor * variation), 1)

        aqi_result = calculate_aqi(pollutants)

        # Format time label (cross-platform, no %-I which fails on Windows)
        time_str = ts.strftime("%I:%M %p").lstrip("0")

        data_points.append({
            "timestamp": ts.isoformat(),
            "time_label": time_str,
            "date_label": ts.strftime("%d-%m-%Y"),
            "hour": hour,
            "aqi": aqi_result["aqi"],
            "category": aqi_result["category"],
            "color": aqi_result["color"],
            "dominant_pollutant": aqi_result["dominant_pollutant"],
            "pollutants": pollutants,
        })

    # Calculate min/max
    aqi_values = [d["aqi"] for d in data_points]
    min_aqi = min(aqi_values)
    max_aqi = max(aqi_values)
    min_point = next(d for d in data_points if d["aqi"] == min_aqi)
    max_point = next(d for d in data_points if d["aqi"] == max_aqi)

    return {
        "city_id": city_id,
        "hours": hours,
        "count": len(data_points),
        "min": {"aqi": min_aqi, "timestamp": min_point["timestamp"], "time_label": min_point["time_label"]},
        "max": {"aqi": max_aqi, "timestamp": max_point["timestamp"], "time_label": max_point["time_label"]},
        "data": data_points,
        "start_date": data_points[0]["date_label"] if data_points else "",
        "end_date": data_points[-1]["date_label"] if data_points else "",
    }
