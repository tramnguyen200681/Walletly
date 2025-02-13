const expenseNameInput = document.getElementById("expense-name");
const expenseAmountInput = document.getElementById("expense-amount");
const expenseCategoryInput = document.getElementById("expense-category");
const addExpenseButton = document.getElementById("add-expense");
const expenseList = document.getElementById("expense-list");
const totalSpentDisplay = document.getElementById("total-expenses");

let totalSpent = 0;

//Add a new expense
addExpenseButton.addEventListener("click", function () {
  const name = expenseNameInput.value.trim();
  const amount = parseFloat(expenseAmountInput.value.trim()); //Convert to a number 
  const category = expenseCategoryInput.value;

  //Validate the input
  if (!name || isNaN(amount) || amount <= 0) {
    alert("Please enter valid expense details!");
    return;
  }

  //Send data to server (use post request)
  fetch('http://localhost:3000/add-expense', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, amount, category }), //Convert expense data into JSON format
  })
    .then(response => response.json())  //Parse the server's response into a JSON object
    .then(data => {
      console.log("Server response:", data); //Log the server response
      if (data.message === 'Expense added successfully') {
        expenseNameInput.value = ""; //Clear input
        expenseAmountInput.value = "";
        printList(); //Fetch the update expense list + refresh display
      } else {
        alert('Error adding expense!');
      }
    })
    .catch(err => {
      alert('Failed to connect to server!');
    });// .catch() -> handle errors that may occur during fetch request.
});//if omitting: web may still work, but we wont see any feedback -> ?the web is broken???

//Display expense list
function printList() {// send request to /expenses to retrieve the expense list
  fetch('http://localhost:3000/expenses') // Take data from server
    .then(response => response.json())
    .then(data => {
      totalSpent = 0;
      expenseList.innerHTML = ""; //Clear old list

      data.forEach(expense => {
        let expenseItem = document.createElement("div");
        expenseItem.classList.add("expense-item");
        expenseItem.innerHTML = `
          <span>${expense.name} (${expense.category}) - $${expense.amount.toFixed(2)}</span>
          <button class="delete-expense" data-id="${expense._id}">Delete</button>
        `;
        expenseList.appendChild(expenseItem);
        totalSpent += expense.amount;
      });

      totalSpentDisplay.textContent = `Total: $${totalSpent.toFixed(2)}`;
      updateChart(data); 
    })
}

//Update pie chart
function updateChart(expenses) { //(printList + delete expense)
  let categoryTotals = { Food: 0, Entertainment: 0, Education: 0, Other: 0 };

  expenses.forEach(expense => {
    if (categoryTotals.hasOwnProperty(expense.category)) {
      categoryTotals[expense.category] += expense.amount; //Add money to the corresponding category.
    }
  });

  expenseChart.data.datasets[0].data = [//array storing the actual data for each cate.
    categoryTotals.Food,
    categoryTotals.Entertainment,
    categoryTotals.Education,
    categoryTotals.Other,
  ];

  expenseChart.update();
}

//Delete an expense
expenseList.addEventListener("click", function (event) {
  if (event.target.classList.contains("delete-expense")) {
    const id = event.target.getAttribute("data-id");

    fetch(`http://localhost:3000/delete-expense/${id}`, { method: 'DELETE' })
      .then(response => response.json())
      .then(data => {
        if (data.message === 'Expense deleted successfully') {
          printList(); //Refresh the list after deletion
        } else {
          alert('Error deleting expense!');
        }
      })
  }
});

//Pie chart
let category = ["Food", "Entertainment", "Education", "Other"];
let pieColor = ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0"];
const myChart = document.getElementById("expense-chart").getContext("2d");
const expenseChart = new Chart(myChart, {
  type: "pie",
  data: {
    labels: category,
    datasets: [
      {
        data: [0, 0, 0, 0],
        backgroundColor: pieColor,
      },
    ],
  },
  options: {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Expense chart.",
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            //Calc the total amount
            const total = context.chart.data.datasets[0].data.reduce((sum, value) => sum + value, 0);
            //Get the current value
            const currentValue = context.raw;
            //%
            const percentage = ((currentValue / total) * 100).toFixed(2);
            return `${context.label}: ${percentage}%`;
          }
          },
    },
  },
}
});
printList();
