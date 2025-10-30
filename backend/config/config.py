import os

class Config:
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    DATASET_PATH = os.path.join(
        os.path.dirname(BASE_DIR), "dataset", "indore_crime.csv"
    )
