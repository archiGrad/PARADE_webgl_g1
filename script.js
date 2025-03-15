window.onload = function() {
	runSketch();
};

function runSketch() {
	var renderer, renderTarget1, renderTarget2, sceneShader, sceneScreen, camera, clock,  uniforms, materialScreen, imgTexture;

	init();



function setupKeyControls() {
  const possibleValues = [1, 3, 5, 7, 10, 20, 100, 1000, 10000];
  let currentIndex = 2; // Start with the third value (5) as base value
  
  // Initialize with base value
  uniforms.u_displaceMagnitude.value = possibleValues[currentIndex];
  
  document.addEventListener('keydown', function(event) {
    if (event.key === 'j') {
      // Move to next value in array
      currentIndex = (currentIndex + 1) % possibleValues.length;
      uniforms.u_displaceMagnitude.value = possibleValues[currentIndex];
    } else if (event.key === 'e') {
      // Generate QR code
      captureAndGenerateQR();
    } else if (event.key === 'r') {
    // Load random texture
    uniforms.u_texture.value = null;
    loadTexture(getRandomImageName());

 materialScreen.map = imgTexture;
    materialScreen.needsUpdate = true;


    }



  });












    }

	animate();

	function init() {
		// Initialize the WebGL renderer
		renderer = new THREE.WebGLRenderer();
		ipreserveDrawingBuffer: true 
		renderer.setPixelRatio(window.devicePixelRatio);
		renderer.setSize(window.innerWidth, window.innerHeight);
		renderer.setClearColor(new THREE.Color(0, 0, 0));

		// Add the renderer to the sketch container
		var container = document.getElementById("sketch-container");
		container.appendChild(renderer.domElement);

		// Initialize the render targets
		var size = renderer.getDrawingBufferSize();
		var options = {
			minFilter : THREE.NearestFilter,
			magFilter : THREE.NearestFilter,
			format : THREE.RGBAFormat
		};
		renderTarget1 = new THREE.WebGLRenderTarget(size.width, size.height, options);
		renderTarget2 = new THREE.WebGLRenderTarget(size.width, size.height, options);

		// Initialize the scenes
		sceneShader = new THREE.Scene();
		sceneScreen = new THREE.Scene();

		// Initialize the camera
		camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

		// Initialize the clock
		clock = new THREE.Clock(true);


		// Create the plane geometry
		var geometry = new THREE.PlaneBufferGeometry(2, 2);

		// Define the shader uniforms
		uniforms = {
			u_time : {
				type : "f",
				value : 0.0
			},
			u_frame : {
				type : "f",
				value : 0.0
			},
			u_resolution : {
				type : "v2",
				value : new THREE.Vector2(window.innerWidth, window.innerHeight)
						.multiplyScalar(window.devicePixelRatio)
			},
			u_mouse : {
				type : "v2",
				value : new THREE.Vector2(0.7 * window.innerWidth, window.innerHeight)
						.multiplyScalar(window.devicePixelRatio)
			},
			u_texture : {
				type : "t",
				value : null
			},
 			u_displaceMagnitude: {
				type: "f",
				value: 5.0
			}
		};

		// Create the shader material
		var materialShader = new THREE.ShaderMaterial({
			uniforms : uniforms,
			vertexShader : document.getElementById("vertexShader").textContent,
			fragmentShader : document.getElementById("fragmentShader").textContent
		});

		// Create the screen material
		materialScreen = new THREE.MeshBasicMaterial();

		// Create the meshes and add them to the scenes
		var meshShader = new THREE.Mesh(geometry, materialShader);
		var meshScreen = new THREE.Mesh(geometry, materialScreen);
		sceneShader.add(meshShader);
		sceneScreen.add(meshScreen);

		// Load the image texture
		loadTexture(getRandomImageName());

 		setupKeyControls();

        // Add QR code button and container
        //addQRCodeButton();
	}

    function addQRCodeButton() {
        // Create QR button
        var qrButton = document.createElement('button');
        qrButton.innerText = 'QR';
        qrButton.style.position = 'absolute';
        qrButton.style.top = '10px';
        qrButton.style.right = '100px';
        qrButton.style.zIndex = '100';
        qrButton.style.cursor = 'pointer';
        
        // Create QR container
        var qrContainer = document.createElement('div');
        qrContainer.id = 'qrCodeContainer';
        
        // Create content div
        var qrContent = document.createElement('div');
        qrContent.id = 'qrContent';
        qrContent.style.color = 'white';
        
        // Add elements to DOM
        qrContainer.appendChild(qrContent);
        document.body.appendChild(qrButton);
        document.body.appendChild(qrContainer);
        
        // Add event listeners
        qrButton.addEventListener('click', captureAndGenerateQR);
    }
    
    
function captureAndGenerateQR() {
    var qrContainer = document.getElementById('qrCodeContainer');
    var qrContent = document.getElementById('qrContent');
    
    qrContainer.style.display = 'block';
    qrContent.innerHTML = 'generating qr..';
    
    // Clear any existing timeout and interval
    if (window.qrHideTimeout) {
        clearTimeout(window.qrHideTimeout);
    }
    if (window.countdownInterval) {
        clearInterval(window.countdownInterval);
    }
    
    // Set timeout to hide QR code after 10 seconds
    window.qrHideTimeout = setTimeout(function() {
        qrContainer.style.display = 'none';
    }, 10000);
    
    // Create countdown element
    var countdownDiv = document.createElement('div');
    countdownDiv.id = 'countdown';
    countdownDiv.style.marginTop = '10px';
    countdownDiv.style.color = 'white';
    countdownDiv.style.fontFamily = 'Arial';
    
    try {
        // Force a render
        render();
        
        // Create a temporary canvas
        var tempCanvas = document.createElement('canvas');
        var maxDimension = 1000;
        
        // Calculate new dimensions
        var width = renderer.domElement.width;
        var height = renderer.domElement.height;
        var ratio = Math.min(maxDimension / width, maxDimension / height);
        
        tempCanvas.width = Math.floor(width * ratio);
        tempCanvas.height = Math.floor(height * ratio);
        
        var tempContext = tempCanvas.getContext('2d');
        tempContext.drawImage(renderer.domElement, 0, 0, tempCanvas.width, tempCanvas.height);
        
        // Get image data
        var imageData = tempCanvas.toDataURL('image/jpeg', 0.5);
        
        // Send to server
        var formData = new FormData();
        formData.append('image_data', imageData);
        
        fetch('/generate-qr', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (!data.success) {
                throw new Error(data.error || 'Failed to generate QR code');
            }
            
            // Display QR code
            qrContent.innerHTML = `
                <img src="${data.qr_code}?t=${Date.now()}" alt="QR Code" style="max-width:300px; max-height:300px;" />
            `;
            
            // Add countdown after QR code
            qrContent.appendChild(countdownDiv);
            
            // Start countdown
            var secondsLeft = 7;
            countdownDiv.textContent = `${secondsLeft}s`;
            
            window.countdownInterval = setInterval(function() {
                secondsLeft--;
                countdownDiv.textContent = `${secondsLeft}s`;
                
                if (secondsLeft <= 0) {
                    clearInterval(window.countdownInterval);
                }
            }, 1000);
        })
        .catch(error => {
            qrContent.innerHTML = 'Error: ' + error.message;
            console.error(error);
        });
        
    } catch (error) {
        qrContent.innerHTML = 'Error: ' + error.message;
        console.error(error);
    }
}



//ls -1 images/*.png | sed 's|.*|"./&",|' > files.txt
    function getRandomImageName() {
        var imageList = [

"./images/IMG_6387.JPG",
"./images/IMG_6388.JPG",
"./images/IMG_6390.JPG",
"./images/IMG_6391.JPG",
"./images/IMG_6392.JPG",
"./images/IMG_6393.JPG",
"./images/IMG_6394.JPG",
"./images/IMG_6395.JPG",
"./images/IMG_6396.JPG",
"./images/IMG_6397.JPG",
"./images/IMG_6398.JPG",
"./images/IMG_6399.JPG",
"./images/IMG_6400.JPG",
"./images/IMG_6401.JPG",
"./images/IMG_6402.JPG",
"./images/IMG_6403.JPG",
"./images/IMG_6404.JPG",
"./images/IMG_6405.JPG",
"./images/IMG_6406.JPG",
"./images/IMG_6407.JPG",
"./images/IMG_6408.JPG",
"./images/IMG_6409.JPG",
"./images/IMG_6410.JPG",
"./images/IMG_6411.JPG",
"./images/IMG_6412.JPG",
"./images/IMG_6413.JPG",
"./images/IMG_6414.JPG",
"./images/IMG_6415.JPG",
"./images/IMG_6416.JPG",
"./images/IMG_6417.JPG",
"./images/IMG_6419.JPG",
"./images/IMG_6420.JPG",
"./images/IMG_6421.JPG",
"./images/IMG_6422.JPG",
"./images/IMG_6423.JPG",
"./images/IMG_6424.JPG",
"./images/IMG_6425.JPG",
"./images/IMG_6426.JPG",
"./images/IMG_6427.JPG",
"./images/IMG_6428.JPG",
"./images/IMG_6429.JPG",
"./images/IMG_6430.JPG"



        ];

        var randomIndex = Math.floor(Math.random() * imageList.length);
    console.log("picked img");
        return imageList[randomIndex];
    }




	/*
	 * Loads a texture and updates the screen material texture uniform
	 */
	function loadTexture(imageFileName) {
		var loader = new THREE.TextureLoader();

		loader.load(imageFileName, function(texture) {
			texture.minFilter = THREE.LinearFilter;
			texture.magFilter = THREE.LinearFilter;
			imgTexture = texture;
			materialScreen.map = imgTexture;
			materialScreen.needsUpdate = true;
		});
	}

	/*
	 * Animates the sketch
	 */
	function animate() {
		requestAnimationFrame(animate);
		render();
	}

	/*
	 * Renders the sketch
	 */
	function render() {
		// Wait until the image texture is loaded
		if (materialScreen.map) {
			// Start rendering the screen scene on the first render target
			if (!uniforms.u_texture.value) {
				renderer.render(sceneScreen, camera, renderTarget1);
			}

			// Update the uniforms
			uniforms.u_time.value = clock.getElapsedTime();
			uniforms.u_frame.value += 1.0;
			uniforms.u_texture.value = renderTarget1.texture;

			// Render the shader scene
			renderer.render(sceneShader, camera, renderTarget2);

			// Update the screen material texture
			materialScreen.map = renderTarget2.texture;
			materialScreen.needsUpdate = true;

			// Render the screen scene
			renderer.render(sceneScreen, camera);

			// Swap the render targets
			var tmp = renderTarget1;
			renderTarget1 = renderTarget2;
			renderTarget2 = tmp;
		}
	}

	/*
	 * Updates the renderer size and the uniforms when the window is resized
	 */
	function onWindowResize(event) {
		// Update the renderer
		renderer.setSize(window.innerWidth, window.innerHeight);

		// Update the render targets
		var size = renderer.getDrawingBufferSize();
		renderTarget1.setSize(size.width, size.height);
		renderTarget2.setSize(size.width, size.height);

		// Update the uniforms
		uniforms.u_resolution.value.set(window.innerWidth, window.innerHeight).multiplyScalar(window.devicePixelRatio);
		uniforms.u_texture.value = null;

		// Start again from the original image texture
		materialScreen.map = imgTexture;
	}

	/*
	 * Updates the uniforms when the mouse moves
	 */
	function onMouseMove(event) {
		// Update the mouse uniform
		uniforms.u_mouse.value.set(event.pageX, window.innerHeight - event.pageY).multiplyScalar(
				window.devicePixelRatio);
	}

	/*
	 * Updates the uniforms when the touch moves
	 */
	function onTouchMove(event) {
		event.preventDefault();

		// Update the mouse uniform
		uniforms.u_mouse.value.set(event.touches[0].pageX, window.innerHeight - event.touches[0].pageY).multiplyScalar(
				window.devicePixelRatio);
	}
}
