// server/server.js
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const retry = require('retry');
const NodeCache = require('node-cache');

const app = express();
const PORT = 5000;

// Enable CORS for local development
app.use(cors());
app.use(express.json()); // Middleware to parse JSON request bodies

// Cache configuration
//let cache = {}; // Object to store cached data for each parameter
const CACHE_EXPIRATION_TIME = 5 * 60 * 1000; // Cache expiration time in milliseconds - 5mins

// Function to fetch data from SOR using POST with retry logic
// Initialize NodeCache with a 5-minute default TTL
const cache = new NodeCache({ stdTTL: 300 }); // TTL in seconds - 5min

// Function to fetch data from SOR using POST with retry logic
const fetchFromSOR = async (param) => {
    const operation = retry.operation({
        retries: 3, // Number of retry attempts
        factor: 2, // Exponential backoff factor
        minTimeout: 1000, // Minimum delay between retries (ms)
        maxTimeout: 5000, // Maximum delay between retries (ms)
    });

    return new Promise((resolve, reject) => {
        operation.attempt(async (currentAttempt) => {
            try {
                console.log(`Attempt ${currentAttempt}: Posting data for '${param}' to SOR`);

                /* // POST 
                const response = await axios.post(
                    'https://sor.api.endpoint',
                    { param }, // Payload for the POST request
                    {
                        headers: {
                            Authorization: 'Bearer YOUR_SOR_TOKEN',
                            'Content-Type': 'application/json',
                        },
                    }
                );
                */

                // GET

                const response = await axios.get(`https://mp6e4f64e02a0c425168.free.beeceptor.com/api/data?param=${param}`, {
                    headers: {
                        Authorization: 'Bearer YOUR_SOR_TOKEN',
                    },
                });

                // If successful, resolve with the response data
                resolve(response.data);

                // Cache the data using the parameter as the key
                cache.set(param, response.data);

                /* // Cache the data
                cache[param] = {
                    data: response.data,
                    timestamp: Date.now(),
                }; */

            } catch (error) {
                if (operation.retry(error)) {
                    console.log(`Retrying due to error: ${error.message}`);
                    return;
                }

                // If retries are exhausted, reject with the error
                reject(operation.mainError());
            }
        });
    });
};

// Unified function to handle GET and POST requests
const getOrPostData = async (param, res) => {
    if (!param) {
        return res.status(400).json({ error: 'Parameter "param" is required' });
    }

    try {
        // Check if data is in the cache
        /*
        // Check if data is in cache and not expired
        if (cache[param] && Date.now() - cache[param].timestamp < CACHE_EXPIRATION_TIME) {
            console.log(`Serving cached data for '${param}'`);
            return res.json(cache[param].data);
        }
        */
        const cachedData = cache.get(param);
        if (cachedData) {
            console.log(`Serving cached data for '${param}'`);
            return res.json(cachedData);
        }

        // If data is not in cache, fetch from SOR
        const data = await fetchFromSOR(param);
        return res.json(data);
    } catch (error) {
        console.error(`Error after retries: ${error.message}`);
        return res.status(500).json({ error: 'Failed to fetch data after retries' });
    }
};

// GET Endpoint
app.get('/api/data', async (req, res) => {
    const param = req.query.param; // Input parameter from query string
    await getOrPostData(param, res);
});

// POST Endpoint
app.post('/api/data', async (req, res) => {
    const { param } = req.body; // Input parameter from request body
    await getOrPostData(param, res);
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
    // const response = await axios.get(`https://mp6e4f64e02a0c425168.free.beeceptor.com/api/data?param=${param}`, {
    console.log(`Server is running on http://localhost:${PORT}`);
});
