// Function to create or get QR container
function getOrCreateQRContainer() {
    let qrContainer = document.getElementById('qr-container');
    if (!qrContainer) {
        qrContainer = document.createElement('div');
        qrContainer.id = 'qr-container';
        qrContainer.style.position = 'fixed';
        qrContainer.style.top = '10px';
        qrContainer.style.right = '10px';
        qrContainer.style.backgroundColor = 'white';
        qrContainer.style.padding = '10px';
        qrContainer.style.border = '1px solid black';
        qrContainer.style.zIndex = '1000';
        qrContainer.style.maxWidth = '300px';
        qrContainer.style.wordBreak = 'break-all';
        document.body.appendChild(qrContainer);
    }
    return qrContainer;
}

// Function to share canvas image with a meaningful URL
function shareCanvasImage() {
    try {
        // Specifically target the canvas in the sketch-container
        const sketchContainer = document.getElementById('sketch-container');
        const canvasToCapture = sketchContainer ? sketchContainer.querySelector('canvas') : null;
        
        if (!canvasToCapture) {
            throw new Error('No canvas found in sketch-container');
        }

        // Capture the canvas as a data URL
        const dataURL = canvasToCapture.toDataURL('image/png');

        // Create or get QR container
        const qrContainer = getOrCreateQRContainer();
        qrContainer.innerHTML = ''; // Clear previous content

        // Create QR code canvas for actual download link
        const qrCanvas = document.createElement('canvas');
        qrCanvas.id = 'qr-code';
        qrContainer.appendChild(qrCanvas);

        // Generate download link
        const downloadLink = document.createElement('a');
        downloadLink.href = dataURL;
        downloadLink.download = 'shader_view.png';
        downloadLink.textContent = 'Download Image';

        // Generate QR code with download link
        const qr = qrcode(0, 'M');
        qr.addData(downloadLink.href);
        qr.make();
        qrCanvas.innerHTML = qr.createImgTag(5);

        // Add download link
        qrContainer.appendChild(downloadLink);

        // Optional: show a preview of the image
        const imgPreview = document.createElement('img');
        imgPreview.src = dataURL;
        imgPreview.style.maxWidth = '200px';
        imgPreview.style.maxHeight = '200px';
        qrContainer.appendChild(imgPreview);

    } catch (error) {
        console.error('Capture failed:', error);
        const qrContainer = getOrCreateQRContainer();
        qrContainer.innerHTML = `<p>Capture Error: ${error.message}</p>`;
    }
}

// Create and add capture button
function createCaptureButton() {
    const button = document.createElement('button');
    button.textContent = 'Capture & Share';
    button.style.position = 'fixed';
    button.style.bottom = '20px';
    button.style.right = '20px';
    button.style.zIndex = '1000';
    button.style.padding = '10px';
    button.style.backgroundColor = '#4CAF50';
    button.style.color = 'white';
    button.style.border = 'none';
    button.style.borderRadius = '5px';
    button.style.cursor = 'pointer';

    button.addEventListener('click', shareCanvasImage);

    document.body.appendChild(button);
}

// Add button when DOM is fully loaded
document.addEventListener('DOMContentLoaded', createCaptureButton);
