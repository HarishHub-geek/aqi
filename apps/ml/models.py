"""
ML Models for AQI prediction.
Implements RandomForest, GradientBoosting, and LSTM models.
"""

import numpy as np
from typing import Dict, List, Tuple, Optional

try:
    from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
    from sklearn.preprocessing import StandardScaler
    from sklearn.model_selection import train_test_split
    HAS_SKLEARN = True
except ImportError:
    HAS_SKLEARN = False

try:
    import torch
    import torch.nn as nn
    HAS_TORCH = True
except ImportError:
    HAS_TORCH = False


class AQIRandomForest:
    """RandomForest model for AQI prediction."""
    
    def __init__(self, n_estimators=100, max_depth=15, random_state=42):
        if not HAS_SKLEARN:
            raise ImportError("scikit-learn is required for RandomForest model")
        self.model = RandomForestRegressor(
            n_estimators=n_estimators,
            max_depth=max_depth,
            random_state=random_state,
            n_jobs=-1,
        )
        self.scaler = StandardScaler()
        self.is_fitted = False
    
    def fit(self, X: np.ndarray, y: np.ndarray):
        X_scaled = self.scaler.fit_transform(X)
        self.model.fit(X_scaled, y)
        self.is_fitted = True
        return self
    
    def predict(self, X: np.ndarray) -> np.ndarray:
        if not self.is_fitted:
            raise ValueError("Model not fitted yet")
        X_scaled = self.scaler.transform(X)
        return self.model.predict(X_scaled)
    
    def get_feature_importance(self) -> np.ndarray:
        return self.model.feature_importances_


class AQIGradientBoosting:
    """GradientBoosting model for AQI prediction."""
    
    def __init__(self, n_estimators=200, max_depth=6, learning_rate=0.1, random_state=42):
        if not HAS_SKLEARN:
            raise ImportError("scikit-learn is required for GradientBoosting model")
        self.model = GradientBoostingRegressor(
            n_estimators=n_estimators,
            max_depth=max_depth,
            learning_rate=learning_rate,
            random_state=random_state,
        )
        self.scaler = StandardScaler()
        self.is_fitted = False
    
    def fit(self, X: np.ndarray, y: np.ndarray):
        X_scaled = self.scaler.fit_transform(X)
        self.model.fit(X_scaled, y)
        self.is_fitted = True
        return self
    
    def predict(self, X: np.ndarray) -> np.ndarray:
        if not self.is_fitted:
            raise ValueError("Model not fitted yet")
        X_scaled = self.scaler.transform(X)
        return self.model.predict(X_scaled)


if HAS_TORCH:
    class AQILSTM(nn.Module):
        """LSTM model for AQI time series prediction."""
        
        def __init__(self, input_size=10, hidden_size=64, num_layers=2, output_size=1, dropout=0.2):
            super(AQILSTM, self).__init__()
            
            self.hidden_size = hidden_size
            self.num_layers = num_layers
            
            self.lstm = nn.LSTM(
                input_size=input_size,
                hidden_size=hidden_size,
                num_layers=num_layers,
                batch_first=True,
                dropout=dropout if num_layers > 1 else 0,
            )
            
            self.fc = nn.Sequential(
                nn.Linear(hidden_size, 32),
                nn.ReLU(),
                nn.Dropout(dropout),
                nn.Linear(32, output_size),
            )
        
        def forward(self, x):
            # x shape: (batch_size, seq_length, input_size)
            lstm_out, (h_n, c_n) = self.lstm(x)
            # Use last time step output
            out = self.fc(lstm_out[:, -1, :])
            return out
else:
    class AQILSTM:
        def __init__(self, *args, **kwargs):
            raise ImportError("PyTorch is required for LSTM model")


if HAS_TORCH:
    class LSTMTrainer:
        """Training wrapper for LSTM model."""
        
        def __init__(self, input_size=10, hidden_size=64, num_layers=2, lr=0.001):
            self.model = AQILSTM(input_size=input_size, hidden_size=hidden_size, num_layers=num_layers)
            self.criterion = nn.MSELoss()
            self.optimizer = torch.optim.Adam(self.model.parameters(), lr=lr)
            self.scaler = StandardScaler() if HAS_SKLEARN else None
            self.is_fitted = False
        
        def prepare_sequences(self, X: np.ndarray, y: np.ndarray, seq_length: int = 24):
            """Create sequences for LSTM training."""
            sequences = []
            targets = []
            
            for i in range(len(X) - seq_length):
                sequences.append(X[i:i+seq_length])
                targets.append(y[i+seq_length])
            
            return np.array(sequences), np.array(targets)
        
        def fit(self, X: np.ndarray, y: np.ndarray, epochs: int = 50, seq_length: int = 24, batch_size: int = 32):
            """Train the LSTM model."""
            if self.scaler:
                X_scaled = self.scaler.fit_transform(X)
            else:
                X_scaled = X
            
            X_seq, y_seq = self.prepare_sequences(X_scaled, y, seq_length)
            
            X_tensor = torch.FloatTensor(X_seq)
            y_tensor = torch.FloatTensor(y_seq).unsqueeze(1)
            
            dataset = torch.utils.data.TensorDataset(X_tensor, y_tensor)
            dataloader = torch.utils.data.DataLoader(dataset, batch_size=batch_size, shuffle=True)
            
            self.model.train()
            losses = []
            
            for epoch in range(epochs):
                epoch_loss = 0
                for batch_X, batch_y in dataloader:
                    self.optimizer.zero_grad()
                    output = self.model(batch_X)
                    loss = self.criterion(output, batch_y)
                    loss.backward()
                    torch.nn.utils.clip_grad_norm_(self.model.parameters(), max_norm=1.0)
                    self.optimizer.step()
                    epoch_loss += loss.item()
                
                avg_loss = epoch_loss / len(dataloader)
                losses.append(avg_loss)
            
            self.is_fitted = True
            return losses
        
        def predict(self, X: np.ndarray, seq_length: int = 24) -> np.ndarray:
            """Generate predictions."""
            if not self.is_fitted:
                raise ValueError("Model not fitted yet")
            
            if self.scaler:
                X_scaled = self.scaler.transform(X)
            else:
                X_scaled = X
            
            self.model.eval()
            predictions = []
            
            with torch.no_grad():
                for i in range(len(X_scaled) - seq_length + 1):
                    seq = torch.FloatTensor(X_scaled[i:i+seq_length]).unsqueeze(0)
                    pred = self.model(seq)
                    predictions.append(pred.item())
            
            return np.array(predictions)
else:
    class LSTMTrainer:
        def __init__(self, *args, **kwargs):
            raise ImportError("PyTorch is required for LSTM model")


class EnsemblePredictor:
    """Ensemble model combining RF, GB, and LSTM predictions."""
    
    def __init__(self):
        self.rf = None
        self.gb = None
        self.lstm = None
        self.weights = {"rf": 0.3, "gb": 0.4, "lstm": 0.3}
    
    def fit(self, X: np.ndarray, y: np.ndarray):
        """Train all models."""
        if HAS_SKLEARN:
            self.rf = AQIRandomForest()
            self.rf.fit(X, y)
            
            self.gb = AQIGradientBoosting()
            self.gb.fit(X, y)
        
        if HAS_TORCH and HAS_SKLEARN:
            self.lstm = LSTMTrainer(input_size=X.shape[1])
            self.lstm.fit(X, y, epochs=30)
    
    def predict(self, X: np.ndarray) -> np.ndarray:
        """Generate ensemble predictions."""
        predictions = []
        total_weight = 0
        
        if self.rf and self.rf.is_fitted:
            rf_pred = self.rf.predict(X)
            predictions.append(("rf", rf_pred))
            total_weight += self.weights["rf"]
        
        if self.gb and self.gb.is_fitted:
            gb_pred = self.gb.predict(X)
            predictions.append(("gb", gb_pred))
            total_weight += self.weights["gb"]
        
        if not predictions:
            return np.zeros(len(X))
        
        # Weighted average
        ensemble = np.zeros(len(X))
        for name, pred in predictions:
            ensemble += pred * (self.weights[name] / total_weight)
        
        return ensemble
