document.addEventListener('DOMContentLoaded', function () {
    const incomeCategoryPieChartCtx = document.getElementById('incomeCategoryPieChart').getContext('2d');
    const expenseCategoryPieChartCtx = document.getElementById('expenseCategoryPieChart').getContext('2d');
    const adviceElement = document.getElementById('advice-text');
    const addExpenseForm = document.getElementById('addExpenseForm');

    let incomePieChartInstance = null;
    let expensePieChartInstance = null;

    const colorPalette = [
        'rgba(255, 99, 132, 0.2)',
        'rgba(54, 162, 235, 0.2)',
        'rgba(255, 206, 86, 0.2)',
        'rgba(75, 192, 192, 0.2)',
        'rgba(153, 102, 255, 0.2)',
        'rgba(255, 159, 64, 0.2)'
    ];

    const borderColorPalette = [
        'rgba(255, 99, 132, 1)',
        'rgba(54, 162, 235, 1)',
        'rgba(255, 206, 86, 1)',
        'rgba(75, 192, 192, 1)',
        'rgba(153, 102, 255, 1)',
        'rgba(255, 159, 64, 1)'
    ];

    // Fetch data for income categories
    async function fetchIncomeData() {
        try {
            const response = await fetch('https://spendsmart-sugk.onrender.com/incomes');
            if (!response.ok) {
                throw new Error('Failed to fetch income data');
            }
            const data = await response.json();
            updatePieChart(data, incomeCategoryPieChartCtx, 'Income Category Distribution', 'income');
        } catch (error) {
            console.error('Error fetching income data:', error);
        }
    }

    // Fetch data for expense categories
    async function fetchExpenseData() {
        try {
            const response = await fetch('https://spendsmart-sugk.onrender.com/expenses');
            if (!response.ok) {
                throw new Error('Failed to fetch expense data');
            }
            const data = await response.json();
            updatePieChart(data, expenseCategoryPieChartCtx, 'Expense Category Distribution', 'expense');

            const advice = generateAdvice(data);
            adviceElement.textContent = advice;
        } catch (error) {
            console.error('Error fetching expense data:', error);
        }
    }

    function updatePieChart(data, chartCtx, title, type) {
        let categories = [];
        let categoryData = [];

        if (data.length > 0) {
            categories = [...new Set(data.map(item => item.category))];
            categoryData = categories.map(category => {
                return data.filter(item => item.category === category).reduce((sum, item) => sum + item.amount, 0);
            });
        } else {
            categories = ['No Data'];
            categoryData = [1];
        }

        const pieChartConfig = {
            type: 'pie',
            data: {
                labels: categories,
                datasets: [{
                    data: categoryData,
                    backgroundColor: colorPalette,
                    borderColor: borderColorPalette,
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: title
                    }
                }
            }
        };

        if (type === 'income') {
            if (incomePieChartInstance) {
                incomePieChartInstance.destroy(); // Destroy the existing pie chart
            }
            incomePieChartInstance = new Chart(chartCtx, pieChartConfig); // Create a new pie chart
        } else if (type === 'expense') {
            if (expensePieChartInstance) {
                expensePieChartInstance.destroy(); // Destroy the existing pie chart
            }
            expensePieChartInstance = new Chart(chartCtx, pieChartConfig); // Create a new pie chart
        }
    }

    function generateAdvice(data) {
        if (data.length === 0) {
            return "No expense data available.";
        }

        const totalAmount = data.reduce((sum, item) => sum + item.amount, 0);
        const highestCategory = data.reduce((max, item) => item.amount > max.amount ? item : max, data[0]);

        let advice = `Your total spending is ₹${totalAmount.toFixed(2)}. `;
        advice += `You are spending the most on ${highestCategory.category} (₹${highestCategory.amount.toFixed(2)}). `;

        if (highestCategory.amount > totalAmount * 0.5) {
            advice += "Consider reducing your spending in this category.";
        } else {
            advice += "Your spending seems balanced.";
        }

        return advice;
    }

    if (addExpenseForm) {
        addExpenseForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const description = document.getElementById('expense-description').value;
            const date = document.getElementById('expense-date').value;
            const amount = parseFloat(document.getElementById('expense-amount').value.replace(/,/g, ''));
            const category = document.getElementById('expense-category').value;

            if (isNaN(amount)) {
                alert('Please enter a valid amount');
                return;
            }

            const response = await fetch('https://spendsmart-sugk.onrender.com/add-expense', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ description, date, amount, category }),
            });

            if (response.ok) {
                // Fetch and update the expense chart
                await fetchExpenseData();

                // Reset the form
                addExpenseForm.reset();
            } else {
                const errorData = await response.json();
                alert(errorData.message);
            }
        });
    }

    fetchIncomeData();
    fetchExpenseData();
});
