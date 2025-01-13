// // server/server.js
// const express = require('express');
// const axios = require('axios');
// const cors = require('cors');

// const app = express();
// const PORT = 5000;

// app.use(cors());
// app.use(express.json());

// // Endpoint to fetch data from the SOR API
// app.get('/api/data', async (req, res) => {
//     try {
//         // Replace with the actual SOR API URL
//         // const SOR_API_URL = 'https://splunk.free.beeceptor.com/getusercredits1';
//         const SOR_API_URL = 'https://mp6e4f64e02a0c425168.free.beeceptor.com/api/data'
//         //const SOR_API_URL = 'https://reqres.in/api/users?page=2'

//         // Gateway-specific headers
//         const headers = {
//             Authorization: `Bearer YOUR_GATEWAY_TOKEN`, // Replace with dynamic token retrieval logic
//             'Content-Type': 'application/json',
//         };

//         // Optional payload if required by the API
//         const payload = {
//             filter: 'last-month', // Example filter; customize based on your use case
//         };

//         // Make the request to the SOR API
//         const response = await axios.get(SOR_API_URL, payload, { headers });
//         console.log('reasponse..', response.data);
//         // Pass data back to the frontend
//         res.json(response.data);
//     } catch (error) {
//         console.error('Error fetching data from SOR API:', error.message);
//         res.status(500).json({ error: 'Failed to retrieve data' });
//     }
// });

// // Mock backend API (replace with real SOR API)
// const mockSORData = {
//     labels: ['Jan', 'Feb', 'Mar', 'Apr', 'June'],
//     values: [12, 19, 3, 5, 2],
// };

// app.get('/api/localdata', (req, res) => {
//     // Simulating data retrieval from SOR API
//     res.json(mockSORData);
// });

// app.listen(PORT, () => {
//     console.log(`Server running on http://localhost:${PORT}`);
// });


// server/server.js
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = 5000;

// Enable CORS for local development
app.use(cors());
app.use(express.json()); // Middleware to parse JSON request bodies

// Cache configuration
let cache = {}; // Object to store cached data for each parameter
const CACHE_EXPIRATION_TIME = 5 * 60 * 1000; // Cache expiration time in milliseconds

// Function to fetch data from SOR for a given parameter
const fetchFromSOR = async (param) => {
    try {
        const response = await axios.get(`https://mp6e4f64e02a0c425168.free.beeceptor.com/api/data?param=${param}`, {
            headers: {
                Authorization: 'Bearer YOUR_SOR_TOKEN',
            },
        });

        // Store the fetched data in the cache
        cache[param] = {
            data: response.data,
            timestamp: Date.now(),
        };

        console.log(`Data for '${param}' fetched from SOR and cached.`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching data for '${param}' from SOR:`, error);
        throw new Error('Failed to fetch data from SOR');
    }
};

// GET Endpoint: Fetch data with query parameter
app.get('/api/data', async (req, res) => {
    const param = req.query.param; // Input parameter from query string

    if (!param) {
        return res.status(400).json({ error: 'Parameter "param" is required' });
    }

    try {
        // Check if data is in cache and not expired
        if (cache[param] && Date.now() - cache[param].timestamp < CACHE_EXPIRATION_TIME) {
            console.log(`Serving cached data for '${param}'`);
            return res.json(cache[param].data);
        }

        // If data is not in cache or expired, fetch from SOR
        const data = await fetchFromSOR(param);
        return res.json(data);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

// POST Endpoint: Fetch data with parameter in the request body
app.post('/api/data', async (req, res) => {
    const { param } = req.body; // Input parameter from request body

    if (!param) {
        return res.status(400).json({ error: 'Parameter "param" is required in the request body' });
    }

    try {
        // Check if data is in cache and not expired
        if (cache[param] && Date.now() - cache[param].timestamp < CACHE_EXPIRATION_TIME) {
            console.log(`Serving cached data for '${param}'`);
            return res.json(cache[param].data);
        }

        // If data is not in cache or expired, fetch from SOR
        const data = await fetchFromSOR(param);
        return res.json(data);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

// Mock backend API (replace with real SOR API)
const mockSORData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'June'],
    values: [12, 19, 3, 5, 2],
};

app.get('/api/localdata', (req, res) => {
    // Simulating data retrieval from SOR API
    const param = req.query.param; // Input parameter from query string

    if (!param) {
        return res.status(400).json({ error: 'Parameter "param" is required' });
    }

    try {
        // Check if data is in cache and not expired
        if (cache[param] && Date.now() - cache[param].timestamp < CACHE_EXPIRATION_TIME) {
            console.log(`Serving cached data for '${param}'`);
            return res.json(cache[param].data);
        }

        // If data is not in cache or expired, fetch from SOR

        // Store the fetched data in the cache
        cache[param] = {
            data: mockSORData,
            timestamp: Date.now(),
        };

        console.log(`Data for '${param}' fetched from SOR and cached.`);        

        return res.json(mockSORData);

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }    
    
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
