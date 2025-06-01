
document.addEventListener('DOMContentLoaded', function() {
    const sidebar = document.getElementById('sidebar');
    const toggleBtn = document.getElementById('toggleBtn');
    const indicator = document.getElementById('indicator');
    const menuItems = document.querySelectorAll('.sidebar ul li');
    const contentItems = document.querySelectorAll('.content-item');
    const totalIncomeElement = document.getElementById('total-income');
    const incomeListElement = document.getElementById('income-list');
    const addIncomeForm = document.getElementById('add-income-form');
    const totalExpenseElement = document.getElementById('total-expense');
    const expenseListElement = document.getElementById('expense-list');
    const addExpenseForm = document.getElementById('add-expense-form');

    let totalIncome = 0;
    let incomes = [];
    let totalExpense = 0;
    let expenses = [];


    function updateCircularProgress(elementId, percentage, color) {
        const progressElement = document.getElementById(elementId);
        if (progressElement) {
            const progressColor = color || '#4caf50'; // Default color if not specified
            const remainingColor = '#333';
            progressElement.style.background = `conic-gradient(
                ${progressColor} ${percentage * 3.6}deg,
                ${remainingColor} ${percentage * 3.6}deg
            )`;
        }
    }
    

// Function to update the dashboard dynamically
function updateDashboard() {
    const balance = totalIncome - totalExpense;

    // Update income, expenses, and balance amounts
    document.getElementById('dincome-amount').textContent = `${totalIncome.toFixed(2)}`;
    document.getElementById('dexpense-amount').textContent = `${totalExpense.toFixed(2)}`;
    document.getElementById('dbalance-amount').textContent = `${balance.toFixed(2)}`;

    // Calculate percentages for progress bars
    const total = totalIncome + totalExpense;
    const incomePercentage = totalIncome > 0 ? Math.round((totalIncome / total) * 100) : 0;
    const expensePercentage = totalExpense > 0 ? Math.round((totalExpense / total) * 100) : 0;
    const balancePercentage = balance > 0 ? Math.round((balance / totalIncome) * 100) : 0;

    // Update progress values
    document.getElementById('income-percentage').textContent = `${incomePercentage}%`;
    document.getElementById('expense-percentage').textContent = `${expensePercentage}%`;
    document.getElementById('balance-percentage').textContent = `${balancePercentage}%`;

    updateCircularProgress('income-progress', incomePercentage, '#4caf50');
    updateCircularProgress('expense-progress', expensePercentage, '#f44336');
    updateCircularProgress('balance-progress', balancePercentage, '#2196f3');
}

    function updateBalance() {
        const balance = totalIncome - totalExpense;
        animateBalanceUpdate(balance);
        updateDashboard();
    }
    function animateBalanceUpdate(newBalance) {
        const digits = Array.from(document.getElementById('balance-display').getElementsByClassName('digit'));
        const balanceStr = newBalance.toString().padStart(digits.length, '0');

        digits.forEach((digit, index) => {
            const front = digit.querySelector('.front');
            const back = digit.querySelector('.back');
            const newDigit = balanceStr[index];

            if (front.textContent !== newDigit) {
                back.textContent = newDigit;
                digit.classList.add('flipping');
                setTimeout(() => {
                    front.textContent = newDigit;
                    digit.classList.remove('flipping');
                }, 300);
            }
        });
    }
    fetchIncomeData();
    fetchExpenseData();
    
// Fetch saved income data

async function fetchIncomeData() {
    const response = await fetch('https://spendsmart-sugk.onrender.com/incomes', {
        method: 'GET',
        credentials: 'include', // Include cookies with the request
        headers: {
            'Content-Type': 'application/json'
        }
    });
    const data = await response.json();
    if (response.ok) {
        incomes = data;
        totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0);
        updateTotalIncome();
        updateIncomeList(incomes);
    } else {
        alert('Failed to fetch income data');
    }
}

async function fetchExpenseData() {
    const response = await fetch('https://spendsmart-sugk.onrender.com/expenses', {
        method: 'GET',
        credentials: 'include', // Include cookies with the request
        headers: {
            'Content-Type': 'application/json'
        }
    });
    const data = await response.json();
    if (response.ok) {
        expenses = data;
        totalExpense = expenses.reduce((sum, expense) => sum + expense.amount, 0);
        updateTotalExpense();
        updateExpenseList(expenses);
    } else {
        console.error('Failed to fetch expense data');
    }
}



function updateTotalExpense() {
    const totalExpense = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    totalExpenseElement.textContent = `₹${totalExpense.toFixed(2)}`;
    updateBalance();
}

function updateExpenseList(expenses) {
    expenseListElement.innerHTML = '';
    expenses.forEach(expense => {
        const li = document.createElement('li');
        li.classList.add('expense-item'); // Add the class to the new expense item
        const formattedDate = new Date(expense.date).toLocaleDateString('en-GB'); // Format the date properly
        li.textContent = `${formattedDate} - ${expense.description}: ₹${expense.amount.toFixed(2)} (Category: ${expense.category})`;
        expenseListElement.appendChild(li);
    });
}

    //income logic
    let priceInputField = document.querySelector('[name="price"]');
    let formatter = new Intl.NumberFormat("en-US", {});

    priceInputField.addEventListener("input", () => {
        let val = priceInputField.value.replace(/,/g, "");
        val = Number(val);
        let newVal = formatter.format(val);
        priceInputField.value = newVal;
    });

    // Toggle sidebar open/close
    toggleBtn.addEventListener('click', () => {
        sidebar.classList.toggle('open');
        // Adjust button icon based on sidebar state
        if (sidebar.classList.contains('open')) {
            toggleBtn.innerHTML = '<i class="fa-solid fa-chevron-left"></i>';
        } else {
            toggleBtn.innerHTML = '<i class="fa-solid fa-chevron-right"></i>';
        }
    });



    // Move the indicator line on hover
    menuItems.forEach((item, index) => {
        item.addEventListener('mouseover', () => {
            const itemHeight = item.offsetHeight;
            const offsetTop = item.offsetTop;
            indicator.style.top = `${offsetTop}px`;
            indicator.style.height = `${itemHeight}px`; // Match the height of the current item
        });
    });

    // Set dashboard content as active by default
    document.getElementById('dashboard-content').classList.add('active');

    menuItems.forEach(item => {
        item.addEventListener('click', function() {
            const contentId = this.id.replace('-menu', '-content');

            contentItems.forEach(content => {
                content.classList.remove('active');
            });

            const contentToShow = document.getElementById(contentId);
            if (contentToShow) {
                contentToShow.classList.add('active');
            }

            // Save the active content ID
            sessionStorage.setItem('activeContentId', contentId);
        });
    });

    if (addIncomeForm) {
        addIncomeForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const description = document.getElementById('income-description').value;
            const date = document.getElementById('income-date').value;
            const amount = parseFloat(document.getElementById('income-amount').value.replace(/,/g, '')); // Ensure amount is a number
            const category = document.getElementById('category').value; // Ensure the category field has the correct ID

            if (isNaN(amount)) {
                alert('Please enter a valid amount');
                return;
            }

            // Save the scroll position and active content ID
            sessionStorage.setItem('scrollPosition', window.scrollY);
            sessionStorage.setItem('activeContentId', 'income-content'); // Assuming 'income-content' is the ID of the income page content

            const response = await fetch('https://spendsmart-sugk.onrender.com/add-income', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ description, date, amount, category }),
            });

            const data = await response.json();
            if (response.ok) {
                // Update the UI or show a success message
                totalIncome += amount;
                updateTotalIncome();
                incomes.push({ description, date, amount, category });
                updateIncomeList(incomes);
                // Clear the form
                addIncomeForm.reset();
                // Refresh the page
                location.reload();
            } else {
                // Show error message
                alert(data.message);
            }
        });
    }

    function updateTotalIncome() {
        totalIncomeElement.textContent = `₹${totalIncome.toFixed(2)}`;
        updateBalance();
    }

     
    function updateIncomeList(incomes) {
        incomeListElement.innerHTML = '';
        incomes.forEach(income => {
            const li = document.createElement('li');
            li.classList.add('income-item'); // Add the class to the new income item
            const formattedDate = new Date(income.date).toLocaleDateString('en-GB'); // Format the date properly
            li.textContent = `${formattedDate} - ${income.description}: ₹${income.amount.toFixed(2)} (Category: ${income.category})`;
            incomeListElement.appendChild(li);
        });
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
            sessionStorage.setItem('scrollPosition', window.scrollY);
            sessionStorage.setItem('activeContentId', 'expenses-content');

            const response = await fetch('https://spendsmart-sugk.onrender.com/add-expense', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ description, date, amount, category }),
            });
            const data = await response.json();
            if (response.ok) {
                expenses.push({ description, date, amount, category });
                totalExpense += amount;
                updateTotalExpense();
                updateExpenseList(expenses);
                addExpenseForm.reset();
                await fetchExpenseData();
                window.location.reload();
            } else {
                alert(data.message);
            }
        });
    }
    
    // Restore the scroll position and active content ID
    const scrollPosition = sessionStorage.getItem('scrollPosition');
    if (scrollPosition) {
        window.scrollTo(0, parseInt(scrollPosition, 10));
        sessionStorage.removeItem('scrollPosition');
    }

    const activeContentId = sessionStorage.getItem('activeContentId');
    if (activeContentId) {
        contentItems.forEach(content => {
            content.classList.remove('active');
        });
        const contentToShow = document.getElementById(activeContentId);
        if (contentToShow) {
            contentToShow.classList.add('active');
        }
        sessionStorage.removeItem('activeContentId');
    }

    fetchExpenseData();
    fetchIncomeData();
    
    
    
    
        

    // Attach logout function to logout button

});
