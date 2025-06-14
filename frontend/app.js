const askButton = document.getElementById("askButton");
const questionInput = document.getElementById("questionInput");
const answerBox = document.getElementById("answerDisplay");
const pdfUpload = document.getElementById("pdfUpload");
const previewElement = document.getElementById("pdfPreview");

// Initially disable ask button until PDF is uploaded
askButton.disabled = true;

askButton.addEventListener("click", async () => {
    if (!questionInput.value.trim()) {
        answerBox.innerHTML = "❌ Please enter a question";
        return;
    }

    answerBox.innerHTML = "🧠 Thinking...";
    askButton.disabled = true;

    try {
        const response = await fetch("http://localhost:5000/ask", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ question: questionInput.value.trim() })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        answerBox.innerHTML = data.answer;
    } catch (error) {
        answerBox.innerHTML = `❌ Error: ${error.message}`;
        console.error("Question error:", error);
    } finally {
        askButton.disabled = false;
    }
});

pdfUpload.addEventListener("change", async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.includes('pdf')) {
        previewElement.innerHTML = "❌ Please upload a PDF file";
        pdfUpload.value = ''; // Reset file input
        return;
    }

    const formData = new FormData();
    formData.append("pdf", file);
    previewElement.innerHTML = "📤 Uploading and processing PDF...";
    askButton.disabled = true;

    try {
        const response = await fetch("http://localhost:5000/upload", {
            method: "POST",
            body: formData
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        previewElement.innerHTML = `✅ ${data.message}`;
        askButton.disabled = false; // Enable ask button after successful upload
    } catch (error) {
        previewElement.innerHTML = `❌ Error: ${error.message}`;
        console.error("Upload error:", error);
        askButton.disabled = true;
        pdfUpload.value = ''; // Reset file input on error
    }
});

// Add input validation for question
questionInput.addEventListener('input', () => {
    if (!questionInput.value.trim() && !askButton.disabled) {
        askButton.disabled = true;
    } else if (questionInput.value.trim() && askButton.disabled) {
        askButton.disabled = false;
    }
});