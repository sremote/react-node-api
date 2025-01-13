// client/src/components/BarChart.js
import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import axios from 'axios';

const BarChart = (props) => {
    const chartRef = useRef(null); // Reference to the canvas element
    const chartInstanceRef = useRef(null); // Reference to the Chart.js instance

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(props.url, {
                    headers: {
                        Authorization: 'Bearer REACT_APP_CLIENT_TOKEN',
                    },
                });

                // Parse the response data into JSON if it's a string
                const data = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;

                // Check and log the parsed data
                console.log('Parsed Data:', data);

                // Destroy existing chart instance if it exists
                if (chartInstanceRef.current) {
                    chartInstanceRef.current.destroy();
                }

                // Create a new Chart.js instance
                if (chartRef.current) {
                    chartInstanceRef.current = new Chart(chartRef.current, {
                        type: 'bar',
                        data: {
                            labels: data.labels,
                            datasets: [
                                {
                                    label: 'Sample Data - ' + props.name,
                                    data: data.values,
                                    backgroundColor: 'rgba(75,192,192,0.6)',
                                    borderColor: 'rgba(75,192,192,1)',
                                    borderWidth: 1,
                                },
                            ],
                        },
                        options: {
                            responsive: true,
                            plugins: {
                                legend: {
                                    display: true,
                                    position: 'top',
                                },
                            },
                            scales: {
                                x: {
                                    beginAtZero: true,
                                },
                                y: {
                                    beginAtZero: true,
                                },
                            },
                        },
                    });
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();

        // Cleanup function to destroy the chart when the component unmounts
        return () => {
            if (chartInstanceRef.current) {
                chartInstanceRef.current.destroy();
            }
        };
    }, []);

    return (
        <div style={{ width: '80%', margin: '0 auto', textAlign: 'center' }}>
            <h2>Bar Chart (Chart.js)</h2>
            <canvas ref={chartRef}></canvas>
        </div>
    );
};

export default BarChart;
