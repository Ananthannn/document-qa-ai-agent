const askButton = document.getElementById("askButton");
const questionInput = document.getElementById("questionInput");
const answerBox = document.getElementById("answerDisplay");
const pdfUpload = document.getElementById("pdfUpload");
const previewElement = document.getElementById("pdfPreview");
const uploadArea = document.getElementById("uploadArea");

function setLoading(isLoading) {
    askButton.classList.toggle('loading', isLoading);
    questionInput.disabled = isLoading;
}

function showMessage(element, message, type = 'info') {
    element.innerHTML = message;
    element.className = `${element.className.split(' ')[0]} ${type}`;
}

async function handleQuestionSubmit() {
    const question = questionInput.value.trim();
    if (!question) {
        showMessage(answerBox, "❌ Please enter a question", 'error');
        return;
    }

    setLoading(true);
    showMessage(answerBox, "🧠 Thinking...");

    try {
        const response = await fetch("http://localhost:5000/ask", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ question })
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || `HTTP error! status: ${response.status}`);
        }

        showMessage(answerBox, data.answer, 'success');
        questionInput.value = ''; // Clear input after successful response
    } catch (error) {
        showMessage(answerBox, `❌ Error: ${error.message}`, 'error');
        console.error("Question error:", error);
    } finally {
        setLoading(false);
    }
}

async function handleFileUpload(files) {
    if (!files.length) return;

    const invalidFiles = Array.from(files).filter(file => !file.type.includes('pdf'));
    if (invalidFiles.length) {
        showMessage(previewElement, "❌ Please upload only PDF files", 'error');
        return;
    }

    const formData = new FormData();
    Array.from(files).forEach(file => formData.append("pdf", file));

    showMessage(previewElement, "📤 Uploading and processing PDFs...");
    questionInput.disabled = true;
    askButton.disabled = true;

    try {
        const response = await fetch("http://localhost:5000/upload", {
            method: "POST",
            body: formData
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || `HTTP error! status: ${response.status}`);
        }

        showMessage(previewElement, `✅ ${data.message}`, 'success');
        questionInput.disabled = false;
        askButton.disabled = false;
        questionInput.focus();
    } catch (error) {
        showMessage(previewElement, `❌ Error: ${error.message}`, 'error');
        console.error("Upload error:", error);
    }
}

// Event Listeners
askButton.addEventListener("click", handleQuestionSubmit);

questionInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
        event.preventDefault();
        handleQuestionSubmit();
    }
});

pdfUpload.addEventListener("change", (event) => handleFileUpload(event.target.files));

// Drag and drop handling
uploadArea.addEventListener("dragover", (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = 'var(--primary-color)';
});

uploadArea.addEventListener("dragleave", (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = '#cbd5e1';
});

uploadArea.addEventListener("drop", (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = '#cbd5e1';
    handleFileUpload(e.dataTransfer.files);
});