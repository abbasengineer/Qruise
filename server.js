const express = require('express');
const path = require('path');
const axios = require('axios'); // Added axios for making API requests
const app = express();
const PORT = process.env.PORT || 3000;


app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
// Added endpoint to get elevation data
app.post('/getElevation', async (req, res) => {
    const { path } = req.body;
    const API_KEY = 'AIzaSyAZ9C_y0e6FU0MijMXVx4VrXLGycma-jTE';
    try {
        const response = await axios.get(`https://maps.googleapis.com/maps/api/elevation/json`, {
            params: {
                locations: path.map(point => `${point.lat},${point.lng}`).join('|'),
                key: API_KEY
            }
        });
        res.json(response.data);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Added endpoint to get traffic data
app.post('/getTraffic', async (req, res) => {
    const { path } = req.body;
    const API_KEY = 'AIzaSyAZ9C_y0e6FU0MijMXVx4VrXLGycma-jTE';
    try {
        const response = await axios.get(`https://maps.googleapis.com/maps/api/directions/json`, {
            params: {
                origin: `${path[0].lat},${path[0].lng}`,
                destination: `${path[path.length - 1].lat},${path[path.length - 1].lng}`,
                waypoints: path.slice(1, -1).map(point => `${point.lat},${point.lng}`).join('|'),
                departure_time: 'now',
                key: API_KEY
            }
        });
        res.json(response.data);
    } catch (error) {
        res.status(500).send(error.message);
    }
});
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
