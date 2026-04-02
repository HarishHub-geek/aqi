"""
AQI Calculator using Indian National Air Quality Index (NAQI) breakpoints.
Calculates AQI for PM2.5, PM10, NO2, SO2, CO, O3 and returns overall AQI,
category, dominant pollutant, and sub-indices.
"""

from typing import Dict, Optional, Tuple

# Indian NAQI Breakpoints: (C_low, C_high, I_low, I_high)
BREAKPOINTS = {
    "pm25": [
        (0, 30, 0, 50),        # Good
        (31, 60, 51, 100),     # Satisfactory
        (61, 90, 101, 200),    # Moderate
        (91, 120, 201, 300),   # Poor
        (121, 250, 301, 400),  # Very Poor
        (251, 500, 401, 500),  # Severe
    ],
    "pm10": [
        (0, 50, 0, 50),
        (51, 100, 51, 100),
        (101, 250, 101, 200),
        (251, 350, 201, 300),
        (351, 430, 301, 400),
        (431, 600, 401, 500),
    ],
    "no2": [
        (0, 40, 0, 50),
        (41, 80, 51, 100),
        (81, 180, 101, 200),
        (181, 280, 201, 300),
        (281, 400, 301, 400),
        (401, 600, 401, 500),
    ],
    "so2": [
        (0, 40, 0, 50),
        (41, 80, 51, 100),
        (81, 380, 101, 200),
        (381, 800, 201, 300),
        (801, 1600, 301, 400),
        (1601, 2400, 401, 500),
    ],
    "co": [
        (0, 1.0, 0, 50),
        (1.1, 2.0, 51, 100),
        (2.1, 10.0, 101, 200),
        (10.1, 17.0, 201, 300),
        (17.1, 34.0, 301, 400),
        (34.1, 50.0, 401, 500),
    ],
    "o3": [
        (0, 50, 0, 50),
        (51, 100, 51, 100),
        (101, 168, 101, 200),
        (169, 208, 201, 300),
        (209, 748, 301, 400),
        (749, 1000, 401, 500),
    ],
}

AQI_CATEGORIES = [
    (0, 50, "Good", "#55a84f"),
    (51, 100, "Satisfactory", "#a3c853"),
    (101, 200, "Moderate", "#fff833"),
    (201, 300, "Poor", "#f29c33"),
    (301, 400, "Very Poor", "#e93f33"),
    (401, 500, "Severe", "#af2d24"),
]


def calculate_sub_index(pollutant: str, concentration: float) -> Optional[float]:
    """Calculate sub-index for a single pollutant."""
    if pollutant not in BREAKPOINTS:
        return None
    
    breakpoints = BREAKPOINTS[pollutant]
    
    for c_low, c_high, i_low, i_high in breakpoints:
        if c_low <= concentration <= c_high:
            # Linear interpolation
            sub_index = ((i_high - i_low) / (c_high - c_low)) * (concentration - c_low) + i_low
            return round(sub_index, 1)
    
    # If concentration exceeds all breakpoints, cap at 500
    if concentration > breakpoints[-1][1]:
        return 500.0
    
    return None


def get_aqi_category(aqi: float) -> Tuple[str, str]:
    """Get AQI category and color for a given AQI value."""
    for low, high, category, color in AQI_CATEGORIES:
        if low <= aqi <= high:
            return category, color
    return "Severe", "#af2d24"


def calculate_aqi(pollutants: Dict[str, float]) -> Dict:
    """
    Calculate overall AQI from pollutant concentrations.
    
    Args:
        pollutants: Dict with keys like 'pm25', 'pm10', 'no2', 'so2', 'co', 'o3'
                    and values as concentrations in µg/m³ (CO in mg/m³)
    
    Returns:
        Dict with aqi, category, color, dominant_pollutant, and sub_indices
    """
    sub_indices = {}
    
    for pollutant, concentration in pollutants.items():
        if concentration is not None and pollutant in BREAKPOINTS:
            sub_index = calculate_sub_index(pollutant, concentration)
            if sub_index is not None:
                sub_indices[pollutant] = {
                    "value": sub_index,
                    "concentration": concentration,
                }
    
    if not sub_indices:
        return {
            "aqi": 0,
            "category": "Unknown",
            "color": "#999999",
            "dominant_pollutant": None,
            "sub_indices": {},
        }
    
    # Overall AQI is the maximum sub-index
    dominant = max(sub_indices, key=lambda k: sub_indices[k]["value"])
    overall_aqi = sub_indices[dominant]["value"]
    category, color = get_aqi_category(overall_aqi)
    
    return {
        "aqi": round(overall_aqi),
        "category": category,
        "color": color,
        "dominant_pollutant": dominant,
        "sub_indices": sub_indices,
    }


# Pollutant display names and units
POLLUTANT_INFO = {
    "pm25": {"name": "PM2.5", "unit": "µg/m³", "full_name": "Fine Particulate Matter"},
    "pm10": {"name": "PM10", "unit": "µg/m³", "full_name": "Coarse Particulate Matter"},
    "no2": {"name": "NO₂", "unit": "µg/m³", "full_name": "Nitrogen Dioxide"},
    "so2": {"name": "SO₂", "unit": "µg/m³", "full_name": "Sulfur Dioxide"},
    "co": {"name": "CO", "unit": "mg/m³", "full_name": "Carbon Monoxide"},
    "o3": {"name": "O₃", "unit": "µg/m³", "full_name": "Ozone"},
}
