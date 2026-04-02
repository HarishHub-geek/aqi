"""
Indian cities configuration with coordinates and metadata.
"""

INDIAN_CITIES = [
    {"id": "delhi", "name": "Delhi", "state": "Delhi", "lat": 28.6139, "lon": 77.2090, "population": 32941000},
    {"id": "mumbai", "name": "Mumbai", "state": "Maharashtra", "lat": 19.0760, "lon": 72.8777, "population": 21297000},
    {"id": "kolkata", "name": "Kolkata", "state": "West Bengal", "lat": 22.5726, "lon": 88.3639, "population": 15134000},
    {"id": "chennai", "name": "Chennai", "state": "Tamil Nadu", "lat": 13.0827, "lon": 80.2707, "population": 11235000},
    {"id": "bangalore", "name": "Bengaluru", "state": "Karnataka", "lat": 12.9716, "lon": 77.5946, "population": 13193000},
    {"id": "hyderabad", "name": "Hyderabad", "state": "Telangana", "lat": 17.3850, "lon": 78.4867, "population": 10534000},
    {"id": "ahmedabad", "name": "Ahmedabad", "state": "Gujarat", "lat": 23.0225, "lon": 72.5714, "population": 8450000},
    {"id": "pune", "name": "Pune", "state": "Maharashtra", "lat": 18.5204, "lon": 73.8567, "population": 7764000},
    {"id": "jaipur", "name": "Jaipur", "state": "Rajasthan", "lat": 26.9124, "lon": 75.7873, "population": 3917000},
    {"id": "lucknow", "name": "Lucknow", "state": "Uttar Pradesh", "lat": 26.8467, "lon": 80.9462, "population": 3700000},
    {"id": "kanpur", "name": "Kanpur", "state": "Uttar Pradesh", "lat": 26.4499, "lon": 80.3319, "population": 3200000},
    {"id": "nagpur", "name": "Nagpur", "state": "Maharashtra", "lat": 21.1458, "lon": 79.0882, "population": 2900000},
    {"id": "patna", "name": "Patna", "state": "Bihar", "lat": 25.6093, "lon": 85.1376, "population": 2700000},
    {"id": "indore", "name": "Indore", "state": "Madhya Pradesh", "lat": 22.7196, "lon": 75.8577, "population": 2500000},
    {"id": "bhopal", "name": "Bhopal", "state": "Madhya Pradesh", "lat": 23.2599, "lon": 77.4126, "population": 2300000},
    {"id": "visakhapatnam", "name": "Visakhapatnam", "state": "Andhra Pradesh", "lat": 17.6868, "lon": 83.2185, "population": 2100000},
    {"id": "vadodara", "name": "Vadodara", "state": "Gujarat", "lat": 22.3072, "lon": 73.1812, "population": 2100000},
    {"id": "guwahati", "name": "Guwahati", "state": "Assam", "lat": 26.1445, "lon": 91.7362, "population": 1100000},
    {"id": "chandigarh", "name": "Chandigarh", "state": "Chandigarh", "lat": 30.7333, "lon": 76.7794, "population": 1100000},
    {"id": "thiruvananthapuram", "name": "Thiruvananthapuram", "state": "Kerala", "lat": 8.5241, "lon": 76.9366, "population": 950000},
]

def get_city_by_id(city_id: str):
    """Get city configuration by ID."""
    for city in INDIAN_CITIES:
        if city["id"] == city_id:
            return city
    return None

def get_all_cities():
    """Get all city configurations."""
    return INDIAN_CITIES
