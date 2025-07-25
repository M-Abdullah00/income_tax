document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const calculateBtn = document.getElementById('calculateBtn');
    const saveBtn = document.getElementById('saveBtn');
    const printBtn = document.getElementById('printBtn');
    const clearBtn = document.getElementById('clearBtn');
    const resultsDiv = document.getElementById('results');
    const savedCalculations = document.getElementById('savedCalculations');
    const savedList = document.getElementById('savedList');
    
    // Event Listeners
    calculateBtn.addEventListener('click', calculateTax);
    saveBtn.addEventListener('click', saveCalculation);
    printBtn.addEventListener('click', printResults);
    clearBtn.addEventListener('click', clearAll);
    
    // Load saved calculations
    loadSavedCalculations();
    
    // Main tax calculation function with CORRECT slab calculations
    function calculateTax() {
        const monthlySalary = parseFloat(document.getElementById('monthlySalary').value) || 0;
        const electricityMonthly = parseFloat(document.getElementById('electricityGrade').value) || 0;
        const gradeIndex = document.getElementById('electricityGrade').selectedIndex;
        const houseRentRate = parseInt(document.getElementById('houseRentRate').value);

        // House rent values per grade and rate (update values as needed)
        const houseRentValues = {
            30: [0, 1337, 1367, 1413, 1458, 1503, 1544, 1589, 1650, 1719, 1781, 1853, 1961, 2091, 2214, 2349, 2727], // index 0 is 'None'
            45: [0, 2006, 2049, 2120, 2187, 2255, 2316, 2384, 2474, 2579, 2670, 2778, 2940, 3135, 3321, 3524, 4091]
        };

        // Get house rent for selected grade and rate
        const hasHouse = document.querySelector('input[name="house"]:checked').value === 'yes';
        const houseMonthly = hasHouse ? houseRentValues[houseRentRate][gradeIndex] : 0;

        const annualSalary = monthlySalary * 12;
        const annualElectricity = electricityMonthly * 12;
        const annualHouse = houseMonthly * 12;
        const annualAdditions = annualElectricity + annualHouse;
        const totalIncome = annualSalary + annualAdditions;

        // Tax calculation logic (unchanged)
        let annualTax = 0;
        if (totalIncome <= 600000) {
            annualTax = 0;
        } 
        else if (totalIncome <= 1200000) {
            // 1% of amount exceeding 600,000
            annualTax = (totalIncome - 600000) * 0.01;
        } 
        else if (totalIncome <= 2200000) {
            // Rs 6,000 + 11% of amount exceeding 1,200,000
            annualTax = 6000 + ((totalIncome - 1200000) * 0.11);
        } 
        else if (totalIncome <= 3200000) {
            // Rs 116,000 + 23% of amount exceeding 2,200,000
            annualTax = 116000 + ((totalIncome - 2200000) * 0.23);
        } 
        else if (totalIncome <= 4100000) {
            // Rs 346,000 + 30% of amount exceeding 3,200,000
            annualTax = 346000 + ((totalIncome - 3200000) * 0.30);
        } 
        else {
            // Rs 616,000 + 35% of amount exceeding 4,100,000
            annualTax = 616000 + ((totalIncome - 4100000) * 0.35);
        }
        
        // Apply surcharge if total income exceeds 10 million
        if (totalIncome > 10000000) {
            const surcharge = annualTax * 0.10;
            annualTax += surcharge;
        }
        
        // Calculate monthly tax and effective rate
        const monthlyTax = annualTax / 12;
        const effectiveTaxRate = totalIncome > 0 ? (annualTax / totalIncome * 100) : 0;

        document.getElementById('annualSalary').textContent = 'Rs ' + Math.round(annualSalary);
        document.getElementById('annualAdditions').textContent = 'Rs ' + Math.round(annualAdditions);
        document.getElementById('taxRate').textContent = Math.round(effectiveTaxRate) + '%';
        document.getElementById('annualTax').textContent = 'Rs ' + Math.round(annualTax);
        document.getElementById('monthlyTax').textContent = 'Rs ' + Math.round(monthlyTax);
        document.getElementById('totalIncome').textContent = 'Rs ' + Math.round(totalIncome);

        // Show results with animation
        resultsDiv.classList.add('show');
        
        // Scroll to results
        resultsDiv.scrollIntoView({ behavior: 'smooth' });
    }
    
    // Save calculation to localStorage
    function saveCalculation() {
        if (!resultsDiv.classList.contains('show')) {
            alert('Please calculate tax first before saving');
            return;
        }
        
        const calculation = {
            date: new Date().toLocaleString(),
            monthlySalary: document.getElementById('monthlySalary').value,
            electricityGrade: document.getElementById('electricityGrade').value,
            hasHouse: document.querySelector('input[name="house"]:checked').value,
            totalIncome: document.getElementById('totalIncome').textContent,
            annualTax: document.getElementById('annualTax').textContent,
            monthlyTax: document.getElementById('monthlyTax').textContent
        };
        
        // Get existing saved calculations or initialize empty array
        let savedCalcs = JSON.parse(localStorage.getItem('taxCalculations')) || [];
        
        // Add new calculation
        savedCalcs.push(calculation);
        
        // Save to localStorage
        localStorage.setItem('taxCalculations', JSON.stringify(savedCalcs));
        
        // Reload saved calculations
        loadSavedCalculations();
        
        // Show saved section
        savedCalculations.classList.add('show');
        
        // Show success message
        alert('Calculation saved successfully!');
    }
    
    // Load saved calculations from localStorage
    function loadSavedCalculations() {
        const savedCalcs = JSON.parse(localStorage.getItem('taxCalculations')) || [];
        
        savedList.innerHTML = ''; // Clear previous list

        if (savedCalcs.length > 0) {
            savedCalcs.forEach((calc, index) => {
                const calcElement = document.createElement('div');
                calcElement.className = 'saved-item';
                calcElement.innerHTML = `
                    <div>
                        <strong>${calc.date}</strong>
                        <div>Total Income: ${calc.totalIncome}</div>
                        <div>Monthly Tax: ${calc.monthlyTax}</div>
                    </div>
                    <button class="delete-btn" data-index="${index}">
                        <i class="fas fa-trash-alt"></i> Delete
                    </button>
                `;
                savedList.appendChild(calcElement);

                // Add event listener to delete button
                calcElement.querySelector('.delete-btn').addEventListener('click', function() {
                    if (confirm('Are you sure you want to delete this calculation?')) {
                        deleteCalculation(index);
                    }
                });
            });

            savedCalculations.classList.add('show');
        } else {
            savedCalculations.classList.remove('show');
        }
    }
    
    // Delete a saved calculation
    function deleteCalculation(index) {
        let savedCalcs = JSON.parse(localStorage.getItem('taxCalculations')) || [];
        
        if (index >= 0 && index < savedCalcs.length) {
            savedCalcs.splice(index, 1);
            localStorage.setItem('taxCalculations', JSON.stringify(savedCalcs));
            loadSavedCalculations(); // Refresh the list
        }
    }
    
    // Print results
    function printResults() {
        if (!resultsDiv.classList.contains('show')) {
            alert('Please calculate tax first before printing');
            return;
        }
        window.print();
    }
    
    // Clear all inputs and results
    function clearAll() {
        document.getElementById('monthlySalary').value = '';
        document.getElementById('electricityGrade').value = '10000';
        document.getElementById('houseYes').checked = true;
        resultsDiv.classList.remove('show');
        savedCalculations.classList.remove('show');
    }
    
    // Helper function to format currency
    function formatCurrency(amount) {
        return 'Rs ' + amount.toLocaleString('en-IN', {
            maximumFractionDigits: 0, // No decimal places
            minimumFractionDigits: 0
        });
    }
});