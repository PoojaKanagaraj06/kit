document.addEventListener('DOMContentLoaded', function() {
    const balanceDisplay = document.getElementById('balance-display');
    let totalIncome = 0;
    let totalExpense = 0;

   
async function fetchIncomeData() {
    try {
        const response = await fetch('https://spendsmart-sugk.onrender.com/incomes', {
            credentials: 'include'
        });
        const data = await response.json();
        totalIncome = data.reduce((sum, income) => sum + income.amount, 0);
        updateBalance();
    } catch (error) {
        console.error('Error fetching income data:', error);
    }
}

async function fetchExpenseData() {
    try {
        const response = await fetch('https://spendsmart-sugk.onrender.com/expenses', {
            credentials: 'include'
        });
        const data = await response.json();
        totalExpense = data.reduce((sum, expense) => sum + expense.amount, 0);
        updateBalance();
    } catch (error) {
        console.error('Error fetching expense data:', error);
    }
}


    function updateBalance() {
        const balance = totalIncome - totalExpense;
        animateBalanceUpdate(balance);
    }

    function animateBalanceUpdate(newBalance) {
        const digits = Array.from(balanceDisplay.getElementsByClassName('digit'));
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
});
