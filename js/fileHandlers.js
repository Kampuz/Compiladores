function openFile(fileInputId) {
    document.getElementById(fileInputId).click();
}

function loadFile(fileInputId, codeOutputId) {
    const fileInput = document.getElementById(fileInputId);
    const codeOutput = document.getElementById(codeOutputId);

    fileInput.onchange = async (event) => {
        const file = event.target.files[0];
        if (!file) return

        try {
            codeOutput.value = await file.text();
        } catch (err) {
            console.error("Error reading file:", err);
        }
    };
}

function saveFile(inputId) {
    const text = document.getElementById(inputId).value;
    let filename = prompt("Enter file name:", "file.txt");

    if (!filename) return;

    if (!filename.endsWith('.txt')) filename += '.txt'; ;

    const blob = new Blob([text], { type: 'text/plain' });
    const link = document.createElement('a');
    
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    
    link.click();
    URL.revokeObjectURL(link.href);
}