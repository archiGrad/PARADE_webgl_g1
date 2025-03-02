// Screen Capture and Upload to 0x0.st

/**
 * Captures the canvas/screen content and uploads it to 0x0.st
 * @param {HTMLCanvasElement} [canvasElement] - Optional canvas element to capture. If not provided, will try screen capture
 * @returns {Promise<string>} URL of the uploaded image
 */
async function captureAndUpload(canvasElement) {
  try {
    let imageBlob;
    
    // If a canvas element is provided, use it directly
    if (canvasElement && canvasElement instanceof HTMLCanvasElement) {
      imageBlob = await new Promise(resolve => {
        canvasElement.toBlob(resolve, 'image/png');
      });
    } 
    // Otherwise try to capture the screen if the API is available
    else if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
      // 1. Capture the screen
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { 
          cursor: "always" 
        },
        audio: false
      });
      
      // Create a video element to hold the stream
      const video = document.createElement('video');
      video.srcObject = stream;
      
      // Wait for the video to load enough data for capture
      await new Promise(resolve => {
        video.onloadedmetadata = () => {
          video.play();
          resolve();
        };
      });
      
      // Create a canvas to capture the frame
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw the current video frame to the canvas
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Stop all tracks in the stream
      stream.getTracks().forEach(track => track.stop());
      
      // Convert canvas to Blob
      imageBlob = await new Promise(resolve => {
        canvas.toBlob(resolve, 'image/png');
      });
    } 
    // If we have THREE.js renderer, try to capture that
    else if (window.THREE && window.renderer instanceof THREE.WebGLRenderer) {
      console.log("Using THREE.WebGLRenderer for capture");
      // Get the renderer canvas
      const canvas = renderer.domElement;
      
      // Convert canvas to Blob
      imageBlob = await new Promise(resolve => {
        canvas.toBlob(resolve, 'image/png');
      });
    }
    // Fallback - look for any canvas in the document
    else {
      const canvas = document.querySelector('canvas');
      if (!canvas) {
        throw new Error('No capture method available - please provide a canvas element');
      }
      
      imageBlob = await new Promise(resolve => {
        canvas.toBlob(resolve, 'image/png');
      });
    }
    
    if (!imageBlob) {
      throw new Error('Failed to capture image');
    }
    
    // 3. Upload to 0x0.st
    const formData = new FormData();
    formData.append('file', imageBlob, 'screenshot.png');
    
    const response = await fetch('https://0x0.st', {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
    }
    
    // 4. Get the URL from the response
    const imageUrl = await response.text();
    console.log('Image uploaded successfully:', imageUrl);
    return imageUrl.trim();
    
  } catch (error) {
    console.error('Error capturing or uploading:', error);
    throw error;
  }
}

/**
 * Creates a UI button for capturing and uploading
 */
function createCaptureButton() {
  const button = document.createElement('button');
  button.textContent = 'Capture & Upload';
  button.style.position = 'fixed';
  button.style.bottom = '20px';
  button.style.right = '20px';
  button.style.zIndex = '9999';
  button.style.padding = '10px 15px';
  button.style.backgroundColor = '#4CAF50';
  button.style.color = 'white';
  button.style.border = 'none';
  button.style.borderRadius = '5px';
  button.style.cursor = 'pointer';
  
  button.addEventListener('click', async () => {
    button.disabled = true;
    button.textContent = 'Capturing...';
    
    try {
      // Try to find a THREE.WebGLRenderer canvas first
      let canvas = null;
      if (window.renderer && renderer instanceof THREE.WebGLRenderer) {
        canvas = renderer.domElement;
      } else {
        // Fallback to any canvas element
        canvas = document.querySelector('canvas');
      }
      
      const url = await captureAndUpload(canvas);
      
      // Create result display
      const result = document.createElement('div');
      result.style.position = 'fixed';
      result.style.bottom = '70px';
      result.style.right = '20px';
      result.style.backgroundColor = 'rgba(0,0,0,0.7)';
      result.style.color = 'white';
      result.style.padding = '10px';
      result.style.borderRadius = '5px';
      result.style.zIndex = '9999';
      
      const link = document.createElement('a');
      link.href = url;
      link.textContent = url;
      link.target = '_blank';
      link.style.color = '#4CAF50';
      
      result.appendChild(document.createTextNode('Uploaded: '));
      result.appendChild(link);
      
      // Add copy button
      const copyBtn = document.createElement('button');
      copyBtn.textContent = 'Copy Link';
      copyBtn.style.marginLeft = '10px';
      copyBtn.style.padding = '2px 5px';
      copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(url).then(() => {
          copyBtn.textContent = 'Copied!';
          setTimeout(() => {
            copyBtn.textContent = 'Copy Link';
          }, 2000);
        });
      });
      
      result.appendChild(copyBtn);
      document.body.appendChild(result);
      
      // Remove the result after 30 seconds
      setTimeout(() => {
        if (result.parentNode) {
          result.parentNode.removeChild(result);
        }
      }, 30000);
      
    } catch (error) {
      alert(`Error: ${error.message}`);
    } finally {
      button.disabled = false;
      button.textContent = 'Capture & Upload';
    }
  });
  
  document.body.appendChild(button);
  return button;
}

// Helper function to find Three.js renderer
function findThreeRenderer() {
  // Look for common variable names where THREE.WebGLRenderer might be stored
  const possibleNames = ['renderer', 'webGLRenderer', 'threeRenderer'];
  
  for (const name of possibleNames) {
    if (window[name] && window[name] instanceof THREE.WebGLRenderer) {
      console.log(`Found THREE.WebGLRenderer as window.${name}`);
      return window[name];
    }
  }
  
  // If we can't find it in global scope, look for canvas elements that might be THREE.js
  const canvases = document.querySelectorAll('canvas');
  if (canvases.length === 1) {
    console.log('Found single canvas element, assuming THREE.js');
    return { domElement: canvases[0] };
  }
  
  return null;
}

// Wait for page to load, then try to initialize
document.addEventListener('DOMContentLoaded', () => {
  // Try to find THREE.js renderer
  window.renderer = window.renderer || findThreeRenderer();
  
  // Create the capture button
  createCaptureButton();
  
  console.log('Screen capture and upload initialized');
});

// Export functions for external use
window.captureAndUpload = captureAndUpload;
window.createCaptureButton = createCaptureButton;
