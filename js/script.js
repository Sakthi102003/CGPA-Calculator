// Initialize DOM elements globally
const semesterSelect = document.getElementById('semester-select');
const subjectsContainer = document.getElementById('subjects-container');
const semestersContainer = document.getElementById('semesters-container');
const addSemesterBtn = document.getElementById('add-semester');
const gpaElement = document.getElementById('semester-gpa');

// Add download button elements
const downloadSemesterBtn = document.createElement('button');
downloadSemesterBtn.textContent = 'Download Semester Report';
downloadSemesterBtn.className = 'download-btn';
downloadSemesterBtn.style.cssText = `
    padding: 10px 20px;
    background-color: #2ecc71;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    margin: 10px;
`;

const downloadCGPABtn = document.createElement('button');
downloadCGPABtn.textContent = 'Download CGPA Report';
downloadCGPABtn.className = 'download-btn';
downloadCGPABtn.style.cssText = `
    padding: 10px 20px;
    background-color: #3498db;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    margin: 10px;
`;

// Add the buttons to appropriate containers
document.getElementById('semester-gpa-container').appendChild(downloadSemesterBtn);
document.getElementById('cgpa-container').appendChild(downloadCGPABtn);

// Global variables
let currentSemester = 1;
let semesterData = {};
let allSemesterGPAs = {};

// Define subjects for each semester globally
const semesterSubjects = {
    1: [
        "Language I",
        "English For Communication I",
        "Programming for C",
        "Programming for C Lab",
        "Data Structures and Algorithm",
        "Data Structures and Algorithm Lab",
        "Computer Architecture & Organization",
        "Environmental Studies",
        "Fundamental to Information Security"
    ],
    2: [
        "Language II",
        "English For Communication II",
        "Object oriented Programming with Java",
        "Object oriented Programming with Java Lab",
        "Operating System",
        "Operating System Lab",
        "Computer Networks",
        "Human Rights",
        "Cryptography Fundamentals"
    ],
    3: [
        "Language III",
        "English For Communication III",
        "Probability & Statistics",
        "Database Management System",
        "Database Management System Lab",
        "Web Technology",
        "Web Technology Lab",
        "Soft Skills I",
        "Fundamentals of Storage and Datacentre",
        "Industrial Training Report",
        "Intro to Cryptocurrency and Bitcoin",  
        "Server security"
    ],
    4: [
        "Introduction to Data Science",
        "Tamil IV",
        "English for communication IV",
        "Principles of Virtualization",
        "Ethical Hacking",
        "Ethical Hacking Lab",
        "Linux Administration",
        "Linux Administration Lab",
        "Soft Skills II",
        "Design and Analysis of Algorithms",
        "Network Security"
    ],
    5: [
        "Containerization using Dockers",
        "Containerization using Dockers Lab",
        "Digital Forensics Investigation",
        "Digital Forensics Investigation Lab",
        "Database Security",
        "IT Governance, Risk, Compliance and Security Audit",
        "Software Engineering",
        "Industrial Training Report",
        "Cybersecurity Incident Response Management"
    ],
    6: [
        "Server Side Scripting",
        "Server Side Scripting Lab",
        "Core Project",
        "Cloud Security",
        "Endpoint Security Management",
        "Business Etiquette"
    ]
};

// Define all functions before using them
function createGradeInput() {
    const gradeInput = document.createElement('input');
    gradeInput.type = 'number';
    gradeInput.className = 'input-field';
    gradeInput.placeholder = 'Grade Points (0-10)';
    gradeInput.min = '0';
    gradeInput.max = '10';
    gradeInput.step = '0.1';

    gradeInput.addEventListener('input', function() {
        const value = parseFloat(this.value);
        if (value < 0 || value > 10) {
            this.style.borderColor = '#e74c3c';
        } else {
            this.style.borderColor = '';
        }
    });

    return gradeInput;
}

function calculateOverallCGPA() {
    const semesterRows = semestersContainer.querySelectorAll('.semester-row');
    let totalWeightedGPA = 0;
    let totalCredits = 0;

    semesterRows.forEach(row => {
        const gpaElement = row.querySelector('.semester-gpa');
        const creditsElement = row.querySelector('.semester-credits');
        
        if (gpaElement && creditsElement) {
            const gpa = parseFloat(gpaElement.value) || 0;
            const credits = parseFloat(creditsElement.value) || 0;
            
            if (gpa > 0 && credits > 0) {
                totalWeightedGPA += gpa * credits;
                totalCredits += credits;
            }
        }
    });

    const cgpa = totalCredits > 0 ? (totalWeightedGPA / totalCredits).toFixed(2) : '0.00';
    const cgpaDisplay = document.getElementById('cgpa');
    if (cgpaDisplay) {
        cgpaDisplay.textContent = cgpa;
        updateGPAColor(cgpaDisplay, cgpa); // Update color based on CGPA
    }

    // Update total credits display in CGPA section
    const totalCreditsDisplay = document.getElementById('total-credits-cgpa');
    if (totalCreditsDisplay) {
        totalCreditsDisplay.textContent = totalCredits;
    }
}

// Function to calculate GPA and update display
function calculateSemesterGPA() {
    const rows = subjectsContainer.querySelectorAll('.input-row');
    let totalPoints = 0;
    let totalCredits = 0;

    rows.forEach(row => {
        const credits = parseFloat(row.querySelector('select[name="credits"]').value) || 0;
        const gradePoints = parseFloat(row.querySelector('input[type="number"]').value) || 0;
        
        if (credits > 0 && gradePoints > 0) {
            totalPoints += credits * gradePoints;
            totalCredits += credits;
        }
    });

    const gpa = totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : '0.00';
    
    // Update total credits display
    if (document.getElementById('total-credits')) {
        document.getElementById('total-credits').textContent = totalCredits;
    }

    // Update GPA display and color
    if (gpaElement) {
        gpaElement.textContent = gpa;
        updateGPAColor(gpaElement, gpa);
    }

    // Save data and update CGPA
    saveSemesterData();
    if (currentSemester) {
        allSemesterGPAs[currentSemester] = { gpa, credits: totalCredits };
    }
    updateCGPACalculator();
}

// Function to update CGPA calculator with semester data
function updateCGPACalculator() {
    if (!semestersContainer) return;
    
    // First clear any existing rows
    semestersContainer.innerHTML = '';
    
    // Add rows for semesters 1-6
    for (let i = 1; i <= 6; i++) {
        const semesterData = allSemesterGPAs[i] || { gpa: '', credits: '' };
        addSemesterRow(`Semester ${i}`, semesterData.gpa, semesterData.credits);
    }
    
    // Update rows with saved data
    updateSemesterRows();
    
    // Calculate overall CGPA
    calculateOverallCGPA();
}

// Update calculations
function updateCalculations() {
    const rows = subjectsContainer.querySelectorAll('.input-row');
    let totalCredits = 0;
    let totalGradePoints = 0;

    rows.forEach(row => {
        const creditsElement = row.querySelector('select[name="credits"]');
        const gradePointsElement = row.querySelector('input[type="number"]');
        
        const credits = creditsElement ? parseFloat(creditsElement.value) || 0 : 0;
        const gradePoints = gradePointsElement ? parseFloat(gradePointsElement.value) || 0 : 0;
        
        if (credits > 0 && gradePoints > 0) {
            totalCredits += credits;
            totalGradePoints += (credits * gradePoints);
        }
    });

    const gpa = totalCredits > 0 ? (totalGradePoints / totalCredits).toFixed(2) : '0.00';
    
    // Store the calculated GPA for this semester
    allSemesterGPAs[currentSemester] = {
        gpa: gpa,
        credits: totalCredits
    };

    // Update the semester GPA display
    if (document.getElementById('total-credits')) {
        document.getElementById('total-credits').textContent = totalCredits;
    }
    if (gpaElement) {
        gpaElement.textContent = gpa;
        
        // Add color coding for GPA
        const numericGPA = parseFloat(gpa);
        if (numericGPA >= 9.0) {
            gpaElement.style.color = '#2ecc71'; // Green for excellent
        } else if (numericGPA >= 8.0) {
            gpaElement.style.color = '#3498db'; // Blue for very good
        } else if (numericGPA >= 7.0) {
            gpaElement.style.color = '#f1c40f'; // Yellow for good
        } else if (numericGPA >= 6.0) {
            gpaElement.style.color = '#e67e22'; // Orange for average
        } else if (numericGPA > 0) {
            gpaElement.style.color = '#e74c3c'; // Red for below average
        } else {
            gpaElement.style.color = 'inherit'; // Default color when no GPA
        }
    }
}

// Update CGPA calculator with semester data
function updateCGPACalculator() {
    if (!semestersContainer) return;
    
    // First clear any existing rows
    semestersContainer.innerHTML = '';
    
    // Add rows for semesters 1-6
    for (let i = 1; i <= 6; i++) {
        const semesterData = allSemesterGPAs[i] || { gpa: '', credits: '' };
        addSemesterRow(`Semester ${i}`, semesterData.gpa, semesterData.credits);
    }
    
    // Calculate overall CGPA
    calculateOverallCGPA();
}

// Function to update semester rows
function updateSemesterRows() {
    const semesterRows = semestersContainer.querySelectorAll('.input-row');
    Object.entries(allSemesterGPAs).forEach(([semesterNum, data]) => {
        let targetRow = Array.from(semesterRows).find(row => 
            row.querySelector('input[type="text"]').value === `Semester ${semesterNum}`
        );
        
        if (!targetRow) {
            // Add a new row for this semester
            addSemesterRow(`Semester ${semesterNum}`, data.gpa, data.credits);
        } else {
            // Update existing row
            const gpaInput = targetRow.querySelector('input[placeholder="GPA"]');
            const creditsInput = targetRow.querySelector('input[placeholder="Total Credits"]');
            
            if (gpaInput && creditsInput) {
                gpaInput.value = data.gpa;
                creditsInput.value = data.credits;
            }
        }
    });
}
function showAutoSaveFeedback() {
    const feedback = document.createElement('div');
    feedback.textContent = 'Changes saved automatically';
    feedback.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #2ecc71;
        color: white;
        padding: 10px 20px;
        border-radius: 5px;
        opacity: 0;
        transition: opacity 0.3s ease;
    `;
    document.body.appendChild(feedback);
    
    setTimeout(() => feedback.style.opacity = '1', 100);
    setTimeout(() => {
        feedback.style.opacity = '0';
        setTimeout(() => document.body.removeChild(feedback), 300);
    }, 2000);
}

function saveSemesterData() {
    try {
        const rows = subjectsContainer.querySelectorAll('.input-row');
        if (!rows || rows.length === 0) return;
        
        semesterData[currentSemester] = Array.from(rows).map(row => {
            const subjectElement = row.querySelector('.subject-name');
            const creditsElement = row.querySelector('select[name="credits"]');
            const gradeElement = row.querySelector('input[type="number"]');
            
            return {
                subject: subjectElement?.textContent || '',
                credits: creditsElement?.value || '',
                gradePoints: gradeElement?.value || ''
            };
        });
        
        localStorage.setItem('semesterData', JSON.stringify(semesterData));
        showAutoSaveFeedback();
    } catch (error) {
        console.error('Error saving semester data:', error);
    }
}

function loadSavedData(semester) {
    if (!semesterData[semester]) return;
    
    const rows = subjectsContainer.querySelectorAll('.input-row');
    const savedSubjects = semesterData[semester];

    rows.forEach((row, index) => {
        if (savedSubjects[index]) {
            const creditsSelect = row.querySelector('select[name="credits"]');
            const gradeInput = row.querySelector('input[type="number"]');
            
            if (creditsSelect && savedSubjects[index].credits) {
                creditsSelect.value = savedSubjects[index].credits;
            }
            if (gradeInput && savedSubjects[index].gradePoints) {
                gradeInput.value = savedSubjects[index].gradePoints;
            }
        }
    });

    updateCalculations();
}

function addSemesterRow(semesterNum = '', gpa = '', credits = '') {
    if (!semestersContainer) return;
    
    // Clear existing content if this is the first row being added
    if (semestersContainer.querySelectorAll('.semester-row').length === 0) {
        semestersContainer.innerHTML = '';
    }
    
    const existingRows = semestersContainer.querySelectorAll('.semester-row');
    if (existingRows.length >= 6 && !semesterNum) {
        console.warn('Maximum of 6 semesters reached');
        return;
    }

    // Extract semester number from semesterNum string if it exists
    const semNumber = semesterNum ? parseInt(semesterNum.replace('Semester ', '')) : (existingRows.length + 1);
    
    // Check if row already exists for this semester
    const existingRow = Array.from(existingRows).find(row => {
        const rowSemName = row.querySelector('.semester-name')?.value;
        return rowSemName === semesterNum;
    });

    if (existingRow) {
        // Update existing row
        const existingGPA = existingRow.querySelector('.semester-gpa');
        const existingCredits = existingRow.querySelector('.semester-credits');
        if (existingGPA) existingGPA.value = gpa;
        if (existingCredits) existingCredits.value = credits;
        return;
    }

    // Create input fields
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.className = 'input-field semester-name';
    nameInput.value = semesterNum || `Semester ${semNumber}`;
    nameInput.readOnly = true;
    
    const gpaInput = document.createElement('input');
    gpaInput.type = 'number';
    gpaInput.className = 'input-field semester-gpa';
    gpaInput.placeholder = 'GPA';
    gpaInput.min = '0';
    gpaInput.max = '10';
    gpaInput.step = '0.01';
    gpaInput.value = gpa || '';
    
    // Add event handlers for automatic CGPA calculation
    gpaInput.addEventListener('input', () => {
        const value = parseFloat(gpaInput.value);
        if (value >= 0 && value <= 10) {
            calculateOverallCGPA();
        }
    });
    
    const creditsInput = document.createElement('input');
    creditsInput.type = 'number';
    creditsInput.title = 'Credit Points - The weightage assigned to this semester (e.g., 20 credit points)';
    creditsInput.className = 'input-field semester-credits';
    creditsInput.placeholder = 'Total Credits';
    creditsInput.min = '0';
    creditsInput.value = credits || '';
    
    // Add event handlers for automatic CGPA calculation
    creditsInput.addEventListener('input', () => {
        const value = parseInt(creditsInput.value);
        if (value >= 0) {
            calculateOverallCGPA();
        }
    });

    // Create row and add all elements
    const row = document.createElement('div');
    row.className = 'input-row semester-row';
    row.appendChild(nameInput);
    row.appendChild(gpaInput);
    row.appendChild(creditsInput);

    // Add delete button
    const deleteButton = document.createElement('button');
    deleteButton.textContent = '×';
    deleteButton.className = 'delete-btn';
    deleteButton.onclick = () => {
        row.remove();
        calculateOverallCGPA(); // Recalculate after deletion
    };
    row.appendChild(deleteButton);
    
    // Add the row to container
    semestersContainer.appendChild(row);
    
    // Trigger initial calculation
    calculateOverallCGPA();
    
    return row;
}

function displaySemesterSubjects(semester) {
    if (!subjectsContainer) {
        console.error('Subjects container not found!');
        return;
    }

    // Clear existing subjects
    subjectsContainer.innerHTML = '';
    
    // Get subjects for this semester
    const subjects = semesterSubjects[parseInt(semester)] || [];
    if (subjects.length === 0) {
        console.warn('No subjects found for semester:', semester);
        return;
    }
    
    // Create rows for each subject
    subjects.forEach(subject => {
        const row = document.createElement('div');
        row.className = 'input-row';
        
        const subjectDiv = document.createElement('div');
        subjectDiv.className = 'input-field subject-name';
        subjectDiv.textContent = subject;
        
        const creditsSelect = document.createElement('select');
        creditsSelect.className = 'input-field';
        creditsSelect.name = 'credits';
        
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'Select Credits';
        defaultOption.disabled = true;
        defaultOption.selected = true;
        creditsSelect.appendChild(defaultOption);
        
        [2, 4].forEach(credit => {
            const option = document.createElement('option');
            option.value = credit.toString();
            option.textContent = credit.toString();
            creditsSelect.appendChild(option);
        });
        
        const gradeInput = createGradeInput();
        
        row.appendChild(subjectDiv);
        row.appendChild(creditsSelect);
        row.appendChild(gradeInput);
        
        // Add event listeners for inputs
        creditsSelect.addEventListener('change', () => {
            updateCalculations();
            saveSemesterData();
        });
        
        gradeInput.addEventListener('input', () => {
            updateCalculations();
            saveSemesterData();
        });
        
        subjectsContainer.appendChild(row);
    });

    // Load saved data if available
    if (semesterData[semester]) {
        loadSavedData(semester);
    }
    
    // Update calculations
    updateCalculations();
}

// Function to generate semester PDF report
function downloadSemesterReport() {
    const doc = new jsPDF();
    let yPos = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Add title
    doc.setFontSize(18);
    doc.text(`Semester ${currentSemester} Report`, pageWidth/2, yPos, { align: 'center' });
    yPos += 20;

    // Add current date
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, yPos);
    yPos += 20;

    // Add subject details
    doc.setFontSize(14);
    doc.text('Subject Details:', 20, yPos);
    yPos += 10;

    const rows = subjectsContainer.querySelectorAll('.input-row');
    rows.forEach(row => {
        const subject = row.querySelector('.subject-name').textContent;
        const credits = row.querySelector('select[name="credits"]').value;
        const grade = row.querySelector('input[type="number"]').value;

        if (credits && grade) {
            doc.setFontSize(12);
            doc.text(`${subject}`, 20, yPos);
            doc.text(`Credits: ${credits}`, 150, yPos);
            doc.text(`Grade: ${grade}`, 180, yPos);
            yPos += 10;
        }
    });

    yPos += 10;
    
    // Add GPA and total credits
    doc.setFontSize(16);
    doc.text('Summary:', 20, yPos);
    yPos += 10;
    doc.setFontSize(14);
    doc.text(`Total Credits: ${document.getElementById('total-credits').textContent}`, 20, yPos);
    yPos += 10;
    doc.text(`Semester GPA: ${gpaElement.textContent}`, 20, yPos);

    // Save the PDF
    doc.save(`Semester_${currentSemester}_Report.pdf`);
}

// Function to generate CGPA PDF report
function downloadCGPAReport() {
    const doc = new jsPDF();
    let yPos = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Add title
    doc.setFontSize(18);
    doc.text('CGPA Report', pageWidth/2, yPos, { align: 'center' });
    yPos += 20;

    // Add current date
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, yPos);
    yPos += 20;

    // Add semester details
    doc.setFontSize(14);
    doc.text('Semester Details:', 20, yPos);
    yPos += 10;

    const semesterRows = semestersContainer.querySelectorAll('.input-row');
    semesterRows.forEach(row => {
        const semester = row.querySelector('input[type="text"]').value;
        const gpa = row.querySelector('input[placeholder="GPA"]').value;
        const credits = row.querySelector('input[placeholder="Total Credits"]').value;

        if (gpa && credits) {
            doc.setFontSize(12);
            doc.text(`${semester}`, 20, yPos);
            doc.text(`GPA: ${gpa}`, 100, yPos);
            doc.text(`Credits: ${credits}`, 160, yPos);
            yPos += 10;
        }
    });

    yPos += 10;
    
    // Add CGPA
    doc.setFontSize(16);
    doc.text('Overall CGPA:', 20, yPos);
    yPos += 10;
    doc.setFontSize(14);
    doc.text(`${document.getElementById('overall-cgpa').textContent}`, 20, yPos);

    // Save the PDF
    doc.save('CGPA_Report.pdf');
}

// Initialize the application
function initializeApp() {
    console.log('Initializing app...'); // Debug log
    
    // Set initial semester
    if (semesterSelect) {
        const urlParams = new URLSearchParams(window.location.search);
        currentSemester = parseInt(urlParams.get('semester')) || 1;
        semesterSelect.value = currentSemester.toString();
        console.log('Current semester:', currentSemester); // Debug log
    }

    // Clear existing content
    if (subjectsContainer) {
        subjectsContainer.innerHTML = '';
    }
    if (semestersContainer) {
        semestersContainer.innerHTML = '';
    }

    // Load saved data
    try {
        const savedData = localStorage.getItem('semesterData');
        if (savedData) {
            semesterData = JSON.parse(savedData);
        }
    } catch (error) {
        console.error('Error loading saved data:', error);
    }

    // Display current semester subjects
    if (subjectsContainer) {
        console.log('Displaying subjects for semester:', currentSemester); // Debug log
        displaySemesterSubjects(currentSemester);
        if (semesterData[currentSemester]) {
            loadSavedData(currentSemester);
        }
    }
}

// Call initialization when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Set initial semester
    const urlParams = new URLSearchParams(window.location.search);
    currentSemester = parseInt(urlParams.get('semester')) || 1;
    if (semesterSelect) {
        semesterSelect.value = currentSemester.toString();
    }

    // First display subjects for current semester
    displaySemesterSubjects(currentSemester);

    // Then try to load saved data
    try {
        const savedData = localStorage.getItem('semesterData');
        if (savedData) {
            semesterData = JSON.parse(savedData);
            if (semesterData[currentSemester]) {
                loadSavedData(currentSemester);
            }
        }
    } catch (error) {
        console.error('Error loading saved data:', error);
    }
});

// Handle semester changes
if (semesterSelect) {
    semesterSelect.addEventListener('change', (e) => {
        const selectedSemester = parseInt(e.target.value);
        currentSemester = selectedSemester;
        displaySemesterSubjects(selectedSemester);
        if (semesterData[selectedSemester]) {
            loadSavedData(selectedSemester);
        }
    });
}

// Add auto-save functionality to subject container
if (subjectsContainer) {
    subjectsContainer.addEventListener('change', (e) => {
        if (e.target.matches('select[name="credits"]') || e.target.matches('input[type="number"]')) {
            updateCalculations();
            saveSemesterData();
        }
    });
    
    subjectsContainer.addEventListener('input', (e) => {
        if (e.target.matches('input[type="number"]')) {
            updateCalculations();
            saveSemesterData();
        }
    });
}

function updateGPAColor(element, gpa) {
    if (gpa >= 9.0) {
        element.style.color = '#2ecc71'; // Outstanding
    } else if (gpa >= 8.0) {
        element.style.color = '#3498db'; // Excellent
    } else if (gpa >= 7.0) {
        element.style.color = '#f1c40f'; // Very Good
    } else if (gpa >= 6.0) {
        element.style.color = '#e67e22'; // Good
    } else if (gpa > 0) {
        element.style.color = '#e74c3c'; // Below Average
    } else {
        element.style.color = 'inherit'; // Default color when no GPA
    }
}
