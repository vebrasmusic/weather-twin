import torch.nn as nn


class Autoencoder(nn.Module):
    def __init__(self):
        super().__init__()

        self.encoder = nn.Sequential(
            nn.Linear(96, 60),
            nn.ReLU(),
            nn.Linear(60, 20),
            nn.ReLU(),
            nn.Linear(20, 3),  # bottleneck
        )

        self.decoder = nn.Sequential(
            nn.Linear(3, 20),
            nn.ReLU(),
            nn.Linear(20, 60),
            nn.ReLU(),
            nn.Linear(60, 96),
            nn.Sigmoid(),  # if input is min-max normalized
        )

    def forward(self, x):
        encoded = self.encoder(x)  # 3D embedding
        reconstructed = self.decoder(encoded)  # Rebuild full 120D
        return reconstructed, encoded
