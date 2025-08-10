# NutriMap 🗺️🍎  
**Mapping and Predicting Food Insecurity Across Houston with ML and Geospatial Intelligence**

NutriMap is a data-driven web application that identifies and visualizes food insecurity patterns across Houston census tracts. It uses unsupervised machine learning and public demographic datasets to cluster neighborhoods by food insecurity risk and enables community planners, nonprofits, and researchers to investigate temporal trends and future vulnerabilities.

---

## 🌟 Project Motivation

Millions of Americans live in food deserts: areas with limited access to affordable and nutritious food. These regions often overlap with underserved communities and are linked to poor health outcomes, educational disparities, and long-term social challenges. While much research exists on food insecurity, accessible **tools that bridge data and decision-making remain scarce.**

**NutriMap** was created to help solve that. It translates complex census data into **clear, interactive geospatial insights**, assisting local policymakers and citizens alike.

Plus, the existing FARA interactive map could use an update😅!


---

## 🧠 What NutriMap Does

NutriMap is built on a hybrid machine learning and data visualization pipeline that:

- 🧩 **Clusters census tracts** into six complex risk levels, and three simple ones: **High Risk**, **Moderate Risk**, and **Low Risk**, using a deep learning–based feature compressor (autoencoder) and K-Means clustering.
- ⏳ **Tracks change over time** (e.g., 2015 vs. 2019) to show how food insecurity evolves across neighborhoods.
- 🗺️ **Visualizes census tracts** on an interactive Leaflet map using GeoJSON boundaries and CSV-based metadata.
- 📊 **Displays tract-level details** in hover/click popups: median income, education levels, poverty rate, and more.
- 🌎 **Scalable nationwide** — with an easy-to-use search bar, NutriMap’s framework can be applied to **EVERY STATE AND EVERY TRACT** in the U.S. to assess local food insecurity risks.

---

## 🔬 Machine Learning Pipeline

NutriMap uses a **three-step ML approach** developed in Python to both **analyze current risk levels** and **predict future tract actions**:

### 1. Dimensionality Reduction with Autoencoders
- **Inputs**: 15+ census variables per tract (poverty %, unemployment, vehicle access, SNAP participation, etc.)
- **Model**: Shallow autoencoder trained to reconstruct input → compresses data into latent space
- **Goal**: Extract nonlinear relationships between variables while reducing redundancy

### 2. Clustering with K-Means
- **Algorithm**: Standard K-Means clustering on the autoencoder’s compressed features
- **Output**: Each tract is assigned a cluster (0, 1, 2, 3, 4, 5, or 6), corresponding to its relative food insecurity level
- **Post-processing**: Clusters are mapped to interpretable labels (e.g., 0 → Food Secure)

### 3. Forecasting with XGBoost
- **Model**: Gradient-boosted decision trees trained using the historical census data as input and the **cluster labels from Step 2** as target outputs
- **Purpose**: Predict which census tracts are most likely to shift into higher-risk categories in the future
- **Benefit**: Empowers stakeholders to **anticipate food insecurity** trends rather than react to them

> This pipeline was run offline using `scikit-learn`, and `PyTorch`, and the results were exported as CSVs for use in the frontend, being converted into readable data by PapaParse.

---

## 🛠️ Technologies Used

### Frontend Stack:
- **React (Vite)** — App framework for performance and flexibility
- **Leaflet.js** — Interactive maps
- **GeoJSON** — Tract-level boundary visualization
- **Papaparse** — Fast CSV parsing client-side

### ML & Data Processing:
- **Python (PyTorch, scikit-learn, pandas)** — Autoencoder training, clustering, preprocessing
- **Jupyter Notebooks** — Model experimentation and tract-level analytics
- **Post-processing pipeline** — Cluster remapping, formatting, and JSON/CSV generation

---
## 📷 Screenshots
<img width="2543" height="1267" alt="swappy-20250630-121549" src="https://github.com/user-attachments/assets/6428a5f4-a709-4ff4-936c-6da4c9501daf" />
<img width="1911" height="913" alt="image" src="https://github.com/user-attachments/assets/beef5157-861b-4046-bc94-67e0048cb77a" />
<img width="1900" height="877" alt="image" src="https://github.com/user-attachments/assets/e9ee6dc5-25a6-4c3d-95cb-efcc8017fc8f" />
<img width="1851" height="877" alt="image" src="https://github.com/user-attachments/assets/7cb10b90-4bdf-4e5f-9a7f-a3e8bd9e1973" />

## 🚀 Running NutriMap with Docker

1. **Clone the repo**
```bash
git clone https://github.com/blueskinlizard/nutrimap.git
cd nutrimap
```
2. **Build the image**
```bash
docker build -t nutrimap .
docker run -p 3000:3000 nutrimap
```
3. **Run the container**
```bash
docker run -p 3000:3000 nutrimap
```
4. ***Open in browser***

Visit http://localhost:3000 to use NutriMap.

