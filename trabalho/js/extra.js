document.getElementById('file-input').addEventListener('change', function (event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = function (e) {
        document.getElementById('code-input').value = e.target.result;
    };

    reader.readAsText(file);
});

function cleanInput() {
    const inputs = document.querySelectorAll('[id$="-input"]');
    inputs.forEach(el => el.value = '');
}
