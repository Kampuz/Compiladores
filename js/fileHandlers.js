function openFile(fileInputId) {
    document.getElementById(fileInputId).click();
}

function loadFile(fileInputId, codeInputId) {
    const fileInput = document.getElementById(fileInputId);
    const codeInput = document.getElementById(codeInputId);

    fileInput.onchange = async (event) => {
        const file = event.target.files[0];
        if (!file) return

        try {
            codeInput.value = await file.text();
        } catch (err) {
            console.error("Error reading file:", err);
        }
    };
}

document.addEventListener('DOMContentLoaded', () => {
    loadFile('file-input', 'code-input');
})

function saveFile(inputId) {
    const text = document.getElementById(inputId).value;
    let filename = prompt("Enter file name:", "file.txt");

    if (!filename) return;

    const blob = new Blob([text], { type: 'text/plain' });
    const link = document.createElement('a');
    
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    
    link.click();
    URL.revokeObjectURL(link.href);
}