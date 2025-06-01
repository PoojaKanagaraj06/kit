document.addEventListener('DOMContentLoaded', function () {
    const incomeExpenseChartCtx = document.getElementById('incomeExpenseChart').getContext('2d');
    const incomeButton = document.getElementById('incomeButton');
    const expenseButton = document.getElementById('expenseButton');
    const timeframeSelect = document.getElementById('timeframeSelect');

    let chartInstance = null;
    let selectedTimeframe = 'daily'; // Default time period

    // Fetch data based on type (income/expense) and timeframe (daily/weekly/monthly)
    async function fetchData(type) {
        try {
            const response = await fetch(`/${type}?timeframe=${selectedTimeframe}`);
            if (!response.ok) {
                throw new Error('Failed to fetch data');
            }
            const data = await response.json();
            updateChart(data, type);
        } catch (error) {
            console.error('Error fetching data:', error);
            
        }
    }

    function updateChart(data, type) {
        const chartData = data.map(item => ({
            x: new Date(item.date),
            y: item.amount
        }));

        const maxValue = Math.max(...data.map(item => item.amount));
        const minIntervalSize = 2000; // Set a minimum interval size
        const intervalSize = Math.min(minIntervalSize, Math.ceil(maxValue / 10)); // Calculate interval size dynamically

        const dataset = {
            label: type === 'incomes' ? 'Income' : 'Expense',
            data: chartData,
            backgroundColor: type === 'incomes' ? 'rgba(75, 192, 192, 0.6)' : 'rgba(255, 99, 132, 0.6)',
            borderColor: type === 'incomes' ? 'rgba(75, 192, 192, 1)' : 'rgba(255, 99, 132, 1)',
            borderWidth: 1,
            barThickness: 20, // Adjust this value as needed
            maxBarThickness: 30 // Adjust this value as needed
        };

        const chartConfig = {
            type: 'bar',
            data: {
                datasets: [dataset]
            },
            options: {
                responsive: true,
                scales: {
                    x: {
                        type: 'time',
                        time: {
                            unit: selectedTimeframe === 'daily' ? 'day' : selectedTimeframe === 'weekly' ? 'week' : 'month',
                            tooltipFormat: 'PP',
                        },
                        ticks: {
                            callback: function (value) {
                                const date = new Date(value);
                                if (selectedTimeframe === 'monthly') {
                                    return new Intl.DateTimeFormat('en-US', { month: 'long' }).format(date);
                                } else if (selectedTimeframe === 'weekly') {
                                    const weekNumber = Math.ceil((date.getDate() - date.getDay() + 1) / 7);
                                    return `Week ${weekNumber}`;
                                } else {
                                    return new Intl.DateTimeFormat('en-US', { day: '2-digit' }).format(date);
                                }
                            }
                        },
                        title: {
                            display: true,
                            text: 'Date'
                        }
                    },
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Amount (₹)'
                        },
                        ticks: {
                            callback: function (value) {
                                const intervals = [];
                                for (let i = 0; i <= maxValue; i += intervalSize) {
                                    if (i + intervalSize <= maxValue) {
                                        intervals.push(`${i}-${i + intervalSize}`);
                                    } else {
                                        intervals.push(`${i}+`);
                                    }
                                }

                                for (let i = 0; i < intervals.length; i++) {
                                    const [min, max] = intervals[i].split('-').map(Number);
                                    if (value >= min && (max ? value < max : true)) {
                                        return intervals[i];
                                    }
                                }
                            }
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        mode: 'index',
                        intersect: false
                    }
                }
            }
        };

        if (chartInstance) {
            chartInstance.destroy(); // Destroy the existing chart
        }
        chartInstance = new Chart(incomeExpenseChartCtx, chartConfig); // Create a new chart
    }

    function handleButtonClick(event) {
        const type = event.target.id === 'incomeButton' ? 'incomes' : 'expenses';
        incomeButton.classList.toggle('active', event.target.id === 'incomeButton');
        expenseButton.classList.toggle('active', event.target.id === 'expenseButton');
        fetchData(type);
    }

    function handleTimeframeChange(event) {
        selectedTimeframe = event.target.value;
        const activeType = incomeButton.classList.contains('active') ? 'incomes' : 'expenses';
        fetchData(activeType);
    }

    incomeButton.addEventListener('click', handleButtonClick);
    expenseButton.addEventListener('click', handleButtonClick);
    timeframeSelect.addEventListener('change', handleTimeframeChange);

    // Initialize the chart with example data
    incomeButton.classList.add('active'); // Set the default active button
    fetchData('incomes');
});
