import {OrbitControls} from './OrbitControls.js'

// Initialize the basic THREE.js scene components
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

// Create and configure the WebGL renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('canvas-container').appendChild(renderer.domElement);

// Set a black background for the scene
scene.background = new THREE.Color(0x000000);

// Add ambient lighting for overall scene illumination
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

// Add directional light for shadows and depth
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(10, 20, 15);
scene.add(directionalLight);

// Enable shadow mapping for realistic lighting
renderer.shadowMap.enabled = true;
directionalLight.castShadow = true;

// Helper function to convert degrees to radians
function degreesToRadians(degrees) {
  var pi = Math.PI;
  return degrees * (pi/180);
}

// Create the main basketball court with court markings
function createBasketballCourt() {
  const textureLoader = new THREE.TextureLoader();
  
  // Create the main court floor geometry
  const courtGeometry = new THREE.BoxGeometry(30, 0.2, 15);
  
  // Load basketball court wood texture with proper handling
  const courtTexture = textureLoader.load(
    './src/textures/basketball_court_wood.jpg',  
    
    // Texture loaded successfully
    function(texture) {
      console.log('Basketball court texture loaded successfully');

      // Rotate texture to match court orientation 
      texture.rotation = Math.PI / 2;
      texture.center.set(0.5, 0.5);
      
      // Set texture wrapping for seamless appearance
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
    },
    
    // Loading progress callback
    function(progress) {
      console.log('Loading court texture: ' + Math.round(progress.loaded / progress.total * 100) + '%');
    },
    
    // Error handling - fallback to solid brown color
    function(error) {
      console.error('Failed to load basketball court texture:', error);
      console.log('Using fallback brown material');
      
      // Use solid brown material if texture fails to load
      court.material = new THREE.MeshPhongMaterial({ 
        color: 0xc68642,
        shininess: 50
      });
    }
  );
  
  // Create court material using the loaded texture
  const courtMaterial = new THREE.MeshPhongMaterial({ 
    map: courtTexture,
    shininess: 30
  });
  
  // Create and position the court mesh
  const court = new THREE.Mesh(courtGeometry, courtMaterial);
  court.receiveShadow = true;
  scene.add(court);
  
  // Create white material for all court line markings
  const courtLinesMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
  
  // Center line dividing the court in half
  const centerLineGeometry = new THREE.BoxGeometry(0.2, 0.01, 15);
  const centerLineMesh = new THREE.Mesh(centerLineGeometry, courtLinesMaterial);
  centerLineMesh.position.y = 0.11; // Slightly above court surface
  scene.add(centerLineMesh);
  
  // Center circle at mid-court
  const centerCircleGeometry = new THREE.RingGeometry(2, 2.2, 32);
  const centerCircleMesh = new THREE.Mesh(centerCircleGeometry, courtLinesMaterial);
  centerCircleMesh.rotation.x = degreesToRadians(-90); // Lay flat on court
  centerCircleMesh.position.y = 0.11;
  scene.add(centerCircleMesh);
  
  // Three-point line for left side of court
  const leftThreePointGeometry = new THREE.RingGeometry(6.7, 6.9, 16, 1, 0, Math.PI);
  const leftThreePointMesh = new THREE.Mesh(leftThreePointGeometry, courtLinesMaterial);
  leftThreePointMesh.rotation.x = degreesToRadians(-90);
  leftThreePointMesh.rotation.z = degreesToRadians(-90); // Orient toward left hoop
  leftThreePointMesh.position.set(-15, 0.11, 0);
  scene.add(leftThreePointMesh);
  
  // Three-point line for right side of court
  const rightThreePointGeometry = new THREE.RingGeometry(6.7, 6.9, 16, 1, 0, Math.PI);
  const rightThreePointMesh = new THREE.Mesh(rightThreePointGeometry, courtLinesMaterial);
  rightThreePointMesh.rotation.x = degreesToRadians(-90);
  rightThreePointMesh.rotation.z = degreesToRadians(90); // Orient toward right hoop
  rightThreePointMesh.position.set(15, 0.11, 0);
  scene.add(rightThreePointMesh);
}

// Create a complete basketball hoop assembly at the specified x position
function createBasketballHoop(hoopPositionX) {
  // Group all hoop components together for easier management
  const basketballHoopGroup = new THREE.Group();
  
  // Create the main support pole
  const supportPoleGeometry = new THREE.CylinderGeometry(0.15, 0.15, 6);
  const supportPoleMaterial = new THREE.MeshPhongMaterial({ color: 0x666666 });
  const supportPoleMesh = new THREE.Mesh(supportPoleGeometry, supportPoleMaterial);
  supportPoleMesh.position.set(hoopPositionX, 3, 0); // Position behind backboard
  supportPoleMesh.castShadow = true;
  basketballHoopGroup.add(supportPoleMesh);

  // Create the support arm connecting pole to backboard
  const supportArmGeometry = new THREE.BoxGeometry(0.2, 0.15, 1);
  const supportArmMaterial = new THREE.MeshPhongMaterial({ color: 0x666666 });
  const supportArmMesh = new THREE.Mesh(supportArmGeometry, supportArmMaterial);
  
  // Position arm based on which side of the court we're on
  if (hoopPositionX < 0) {
    // Left side hoop - arm extends toward center court
    supportArmMesh.position.set(hoopPositionX + 0.5, 5, 0);
    supportArmMesh.rotation.y = degreesToRadians(90);
  } else {
    // Right side hoop - arm extends toward center court
    supportArmMesh.position.set(hoopPositionX - 0.5, 5, 0);
    supportArmMesh.rotation.y = degreesToRadians(-90);
  }
  
  supportArmMesh.castShadow = true;
  basketballHoopGroup.add(supportArmMesh);

  // Set up texture loader for backboard graphics
  const textureLoader = new THREE.TextureLoader();
  
  // Create backboard geometry
  const backboardGeometry = new THREE.BoxGeometry(2.8, 1.6, 0.1);
  
  // Load the basketball backboard texture
  const backboardTexture = textureLoader.load(
    './src/textures/Basketball_Backboard.jpg',
    
    // Texture loaded successfully
    function(texture) {
      console.log('Basketball backboard texture loaded successfully');
      
      // Set texture wrapping to prevent tiling
      texture.wrapS = THREE.ClampToEdgeWrapping;
      texture.wrapT = THREE.ClampToEdgeWrapping;
    },
    
    // Loading progress callback
    function(progress) {
      console.log('Loading backboard texture: ' + Math.round(progress.loaded / progress.total * 100) + '%');
    },
    
    // Error handling
    function(error) {
      console.error('Failed to load basketball backboard texture:', error);
      console.log('Using fallback white material');
    }
  );
  
  // Create materials array for different faces of the backboard
  const backboardMaterials = [
    // Side faces use simple white material
    new THREE.MeshPhongMaterial({ color: 0xffffff, transparent: true, opacity: 0.8 }),
    new THREE.MeshPhongMaterial({ color: 0xffffff, transparent: true, opacity: 0.8 }),
    // Top and bottom faces
    new THREE.MeshPhongMaterial({ color: 0xffffff, transparent: true, opacity: 0.8 }),
    new THREE.MeshPhongMaterial({ color: 0xffffff, transparent: true, opacity: 0.8 }),
    // Front face gets the detailed texture
    new THREE.MeshPhongMaterial({ 
      map: backboardTexture, 
      transparent: true, 
      opacity: 0.9, 
      shininess: 20 
    }),
    // Back face uses simple white material
    new THREE.MeshPhongMaterial({ color: 0xffffff, transparent: true, opacity: 0.8 })
  ];
  
  // Create the backboard mesh with different materials per face
  const backboardMesh = new THREE.Mesh(backboardGeometry, backboardMaterials);

  // Position and orient backboard to face the center of the court
  if (hoopPositionX < 0) {
    // Left backboard faces toward center court
    backboardMesh.position.set(hoopPositionX + 1, 5, 0);
    backboardMesh.rotation.y = degreesToRadians(90);
  } else {
    // Right backboard faces toward center court
    backboardMesh.position.set(hoopPositionX - 1, 5, 0);
    backboardMesh.rotation.y = degreesToRadians(-90);
  }

  backboardMesh.castShadow = true;
  backboardMesh.receiveShadow = true;
  basketballHoopGroup.add(backboardMesh);
  
  scene.add(basketballHoopGroup);

  // Create the basketball rim using a torus geometry
  const basketballRimGeometry = new THREE.TorusGeometry(0.23, 0.02, 8, 16);
  const basketballRimMaterial = new THREE.MeshPhongMaterial({ color: 0xff6600 });
  const basketballRimMesh = new THREE.Mesh(basketballRimGeometry, basketballRimMaterial);

  // Orient rim horizontally and position in front of backboard
  basketballRimMesh.rotation.x = degreesToRadians(-90);

  if (hoopPositionX < 0) {
    // Position left rim in front of left backboard
    basketballRimMesh.position.set(hoopPositionX + 1.3, 4.5, 0);
  } else {
    // Position right rim in front of right backboard
    basketballRimMesh.position.set(hoopPositionX - 1.3, 4.5, 0);
  }

  basketballRimMesh.castShadow = true;
  basketballHoopGroup.add(basketballRimMesh);

  // Create basketball net using line segments
  const basketballNetGroup = new THREE.Group();
  const numberOfNetSegments = 12; // Number of vertical net strands
  const netLineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });

  // Create vertical net strands hanging from the rim
  for (let segmentIndex = 0; segmentIndex < numberOfNetSegments; segmentIndex++) {
    const segmentAngle = (segmentIndex / numberOfNetSegments) * Math.PI * 2;
    
    // Calculate positions at rim and bottom of net
    const rimTopX = Math.cos(segmentAngle) * 0.23;
    const rimTopZ = Math.sin(segmentAngle) * 0.23;
    const netBottomX = Math.cos(segmentAngle) * 0.15;
    const netBottomZ = Math.sin(segmentAngle) * 0.15;
    
    // Create vertical line from rim to bottom
    const verticalNetPoints = [
      new THREE.Vector3(rimTopX, 0, rimTopZ),
      new THREE.Vector3(netBottomX, -0.4, netBottomZ)
    ];
    
    const verticalNetGeometry = new THREE.BufferGeometry().setFromPoints(verticalNetPoints);
    const verticalNetLine = new THREE.Line(verticalNetGeometry, netLineMaterial);
    basketballNetGroup.add(verticalNetLine);
  }

  // Create horizontal connecting lines at different levels
  const horizontalLevels = [-0.1, -0.25, -0.35];
  
  for (let levelIndex = 0; levelIndex < horizontalLevels.length; levelIndex++) {
    const yLevel = horizontalLevels[levelIndex];
    const radiusAtLevel = 0.23 - (Math.abs(yLevel) * 0.2); // Net tapers toward bottom
    
    // Create connecting lines between adjacent vertical strands
    for (let segmentIndex = 0; segmentIndex < numberOfNetSegments; segmentIndex++) {
      const angle1 = (segmentIndex / numberOfNetSegments) * Math.PI * 2;
      const angle2 = ((segmentIndex + 1) / numberOfNetSegments) * Math.PI * 2;
      
      const x1 = Math.cos(angle1) * radiusAtLevel;
      const z1 = Math.sin(angle1) * radiusAtLevel;
      const x2 = Math.cos(angle2) * radiusAtLevel;
      const z2 = Math.sin(angle2) * radiusAtLevel;
      
      // Create horizontal connecting line
      const horizontalNetPoints = [
        new THREE.Vector3(x1, yLevel, z1),
        new THREE.Vector3(x2, yLevel, z2)
      ];
      
      const horizontalNetGeometry = new THREE.BufferGeometry().setFromPoints(horizontalNetPoints);
      const horizontalNetLine = new THREE.Line(horizontalNetGeometry, netLineMaterial);
      basketballNetGroup.add(horizontalNetLine);
    }
  }

  // Position the complete net under the rim
  if (hoopPositionX < 0) {
    basketballNetGroup.position.set(hoopPositionX + 1.3, 4.5, 0);
  } else {
    basketballNetGroup.position.set(hoopPositionX - 1.3, 4.5, 0);
  }

  basketballHoopGroup.add(basketballNetGroup);
}

// Create a realistic basketball with texture and seam lines
function createBasketball() {
  // Group to hold the ball and all seam lines
  const basketballGroup = new THREE.Group();
  
  const textureLoader = new THREE.TextureLoader();
  
  // Create sphere geometry with high detail for smooth appearance
  const basketballGeometry = new THREE.SphereGeometry(0.12, 64, 64);
  
  // Load basketball texture
  const basketballTexture = textureLoader.load(
    './src/textures/basketball.jpeg',
    
    // Texture loaded successfully
    function(texture) {
      console.log('Basketball texture loaded successfully');
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
    },
    
    // Loading progress callback
    function(progress) {
      console.log('Loading basketball texture: ' + Math.round(progress.loaded / progress.total * 100) + '%');
    },
    
    // Error handling - fallback to orange color
    function(error) {
      console.error('Failed to load basketball texture:', error);
      console.log('Using fallback orange material');
      basketballMesh.material = new THREE.MeshPhongMaterial({ 
        color: 0xff6600,
        shininess: 30
      });
    }
  );
  
  // Create basketball material
  const basketballMaterial = new THREE.MeshPhongMaterial({ 
    map: basketballTexture,
    color: 0xff6600, // Orange base color
    shininess: 20,
    bumpScale: 0.1
  });
  
  // Create the main basketball mesh
  const basketballMesh = new THREE.Mesh(basketballGeometry, basketballMaterial);
  basketballMesh.castShadow = true;
  basketballMesh.receiveShadow = true;
  basketballGroup.add(basketballMesh);
  
  // Create realistic basketball seam lines
  const ballRadius = 0.118; // Slightly smaller radius so seams sit on surface
  
  // Helper function to create wide seam lines using tube geometry
  function createWideSeam(points, thickness = 0.004) {
    const curve = new THREE.CatmullRomCurve3(points);
    
    const tubeGeometry = new THREE.TubeGeometry(curve, 32, thickness, 8, false);
    const seamMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x000000,
      shininess: 5
    });
    
    const seamMesh = new THREE.Mesh(tubeGeometry, seamMaterial);
    seamMesh.castShadow = true;
    return seamMesh;
  }
  
  // Create the four main vertical seam lines
  
  // First vertical seam (front of ball)
  const seam1Points = [];
  for (let i = 0; i <= 32; i++) {
    const t = i / 32;
    const phi = Math.PI * t; // From north pole to south pole
    
    // Create gentle S-curve characteristic of basketball seams
    const theta = Math.sin(phi * 2) * 0.4;
    
    const x = ballRadius * Math.sin(phi) * Math.cos(theta);
    const y = ballRadius * Math.cos(phi);
    const z = ballRadius * Math.sin(phi) * Math.sin(theta);
    
    seam1Points.push(new THREE.Vector3(x, y, z));
  }
  const seam1 = createWideSeam(seam1Points, 0.003);
  basketballGroup.add(seam1);
  
  // Second vertical seam (90 degrees rotated)
  const seam2Points = [];
  for (let i = 0; i <= 32; i++) {
    const t = i / 32;
    const phi = Math.PI * t;
    
    const theta = Math.PI/2 + Math.sin(phi * 2) * 0.4;
    
    const x = ballRadius * Math.sin(phi) * Math.cos(theta);
    const y = ballRadius * Math.cos(phi);
    const z = ballRadius * Math.sin(phi) * Math.sin(theta);
    
    seam2Points.push(new THREE.Vector3(x, y, z));
  }
  const seam2 = createWideSeam(seam2Points, 0.003);
  basketballGroup.add(seam2);
  
  // Third vertical seam (back of ball)
  const seam3Points = [];
  for (let i = 0; i <= 32; i++) {
    const t = i / 32;
    const phi = Math.PI * t;
    
    const theta = Math.PI + Math.sin(phi * 2) * 0.4;
    
    const x = ballRadius * Math.sin(phi) * Math.cos(theta);
    const y = ballRadius * Math.cos(phi);
    const z = ballRadius * Math.sin(phi) * Math.sin(theta);
    
    seam3Points.push(new THREE.Vector3(x, y, z));
  }
  const seam3 = createWideSeam(seam3Points, 0.003);
  basketballGroup.add(seam3);
  
  // Fourth vertical seam (270 degrees rotated)
  const seam4Points = [];
  for (let i = 0; i <= 32; i++) {
    const t = i / 32;
    const phi = Math.PI * t;
    
    const theta = -Math.PI/2 + Math.sin(phi * 2) * 0.4;
    
    const x = ballRadius * Math.sin(phi) * Math.cos(theta);
    const y = ballRadius * Math.cos(phi);
    const z = ballRadius * Math.sin(phi) * Math.sin(theta);
    
    seam4Points.push(new THREE.Vector3(x, y, z));
  }
  const seam4 = createWideSeam(seam4Points, 0.003);
  basketballGroup.add(seam4);
  
  // Create horizontal connecting seam rings
  
  // Upper connecting ring
  const topRingPoints = [];
  const topPhi = Math.PI * 0.25;
  for (let i = 0; i <= 32; i++) {
    const theta = (i / 32) * Math.PI * 2;
    
    const x = ballRadius * Math.sin(topPhi) * Math.cos(theta);
    const y = ballRadius * Math.cos(topPhi);
    const z = ballRadius * Math.sin(topPhi) * Math.sin(theta);
    
    topRingPoints.push(new THREE.Vector3(x, y, z));
  }
  const topRing = createWideSeam(topRingPoints, 0.003);
  basketballGroup.add(topRing);
  
  // Lower connecting ring
  const bottomRingPoints = [];
  const bottomPhi = Math.PI * 0.75;
  for (let i = 0; i <= 32; i++) {
    const theta = (i / 32) * Math.PI * 2;
    
    const x = ballRadius * Math.sin(bottomPhi) * Math.cos(theta);
    const y = ballRadius * Math.cos(bottomPhi);
    const z = ballRadius * Math.sin(bottomPhi) * Math.sin(theta);
    
    bottomRingPoints.push(new THREE.Vector3(x, y, z));
  }
  const bottomRing = createWideSeam(bottomRingPoints, 0.003);
  basketballGroup.add(bottomRing);
  
  // Center equator ring
  const equatorPoints = [];
  const equatorPhi = Math.PI * 0.5; // Exact center of ball
  for (let i = 0; i <= 32; i++) {
    const theta = (i / 32) * Math.PI * 2;
    
    const x = ballRadius * Math.sin(equatorPhi) * Math.cos(theta);
    const y = ballRadius * Math.cos(equatorPhi);
    const z = ballRadius * Math.sin(equatorPhi) * Math.sin(theta);
    
    equatorPoints.push(new THREE.Vector3(x, y, z));
  }
  const equatorRing = createWideSeam(equatorPoints, 0.003);
  basketballGroup.add(equatorRing);
  
  // Position basketball at center court, slightly above ground
  basketballGroup.position.set(0, 0.25, 0);
  
  // Rotate basketball slightly for better visual presentation of seams
  basketballGroup.rotation.y = Math.PI / 6;
  basketballGroup.rotation.x = Math.PI / 12;
  
  // Add the complete basketball to the scene
  scene.add(basketballGroup);
  
  return basketballGroup;
}

// Initialize all scene elements
createBasketballCourt();
createBasketballHoop(-15); // Left hoop
createBasketballHoop(15);  // Right hoop
createBasketball();

// Position camera for optimal initial view of the court
const cameraTranslate = new THREE.Matrix4();
cameraTranslate.makeTranslation(0, 15, 30);
camera.applyMatrix4(cameraTranslate);

// Set up orbit controls for interactive camera movement
const controls = new OrbitControls(camera, renderer.domElement);
let isOrbitEnabled = true;

// Instructions display
const instructionsElement = document.createElement('div');
instructionsElement.style.position = 'absolute';
instructionsElement.style.bottom = '20px';
instructionsElement.style.left = '20px';
instructionsElement.style.color = 'white';
instructionsElement.style.fontSize = '16px';
instructionsElement.style.fontFamily = 'Arial, sans-serif';
instructionsElement.style.textAlign = 'left';
// instructionsElement.innerHTML = `
//   <h3>Controls:</h3>
//   <p>O - Toggle orbit camera</p>
// `
;
document.body.appendChild(instructionsElement);

// Handle keyboard input for camera controls
function handleKeyDown(e) {
  if (e.key === "o") {
    // Toggle orbit camera controls on/off
    isOrbitEnabled = !isOrbitEnabled;
  }
}

document.addEventListener('keydown', handleKeyDown);

// Main animation loop
function animate() {
  requestAnimationFrame(animate);
  
  // Update orbit controls based on current state
  controls.enabled = isOrbitEnabled;
  controls.update();
  
  // Render the scene
  renderer.render(scene, camera);
}

// Start the animation loop
animate();