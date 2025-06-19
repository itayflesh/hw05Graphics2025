import {OrbitControls} from './OrbitControls.js'

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('canvas-container').appendChild(renderer.domElement);
// Set background color
scene.background = new THREE.Color(0x000000);

// Add lights to the scene
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(10, 20, 15);
scene.add(directionalLight);

// Enable shadows
renderer.shadowMap.enabled = true;
directionalLight.castShadow = true;

function degrees_to_radians(degrees) {
  var pi = Math.PI;
  return degrees * (pi/180);
}

// Create basketball court with texture
function createBasketballCourt() {
  // Create texture loader
  const textureLoader = new THREE.TextureLoader();
  
  // Court floor with basketball court texture
  const courtGeometry = new THREE.BoxGeometry(30, 0.2, 15);
  
  // Load the basketball court wood texture
  const courtTexture = textureLoader.load(
    './src/textures/basketball_court_wood.jpg',  
    
    // Success callback
    function(texture) {
      console.log('Basketball court texture loaded successfully');

      // Rotate texture 90 degrees to fix orientation
      texture.rotation = Math.PI / 2;  // Rotate 90 degrees
      texture.center.set(0.5, 0.5);    // Set rotation center to middle of texture
      
      // Optional: Adjust texture properties for better appearance
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      
    },
    
    // Progress callback
    function(progress) {
      console.log('Loading court texture: ' + Math.round(progress.loaded / progress.total * 100) + '%');
    },
    
    // Error callback - fallback to brown color if texture fails
    function(error) {
      console.error('Failed to load basketball court texture:', error);
      console.log('Using fallback brown material');
      
      // Fallback to simple brown material
      court.material = new THREE.MeshPhongMaterial({ 
        color: 0xc68642,  // Brown wood color
        shininess: 50
      });
    }
  );
  
  // Court material with texture
  const courtMaterial = new THREE.MeshPhongMaterial({ 
    map: courtTexture,
    shininess: 30  // Adjust shininess for realistic wood appearance
  });
  
  const court = new THREE.Mesh(courtGeometry, courtMaterial);
  court.receiveShadow = true;
  scene.add(court);
  
  
}

function createBasketballHoop(hoopPositionX) {
  // Group all hoop components together
  const basketballHoopGroup = new THREE.Group();
  
  // Support pole behind the backboard
  const supportPoleGeometry = new THREE.CylinderGeometry(0.15, 0.15, 6);
  const supportPoleMaterial = new THREE.MeshPhongMaterial({ color: 0x666666 });
  const supportPoleMesh = new THREE.Mesh(supportPoleGeometry, supportPoleMaterial);
  supportPoleMesh.position.set(hoopPositionX, 3, 0); // Behind the court, 6 units tall (3 is center height)
  supportPoleMesh.castShadow = true;
  basketballHoopGroup.add(supportPoleMesh);

  // Support arm connecting pole to backboard
  const supportArmGeometry = new THREE.BoxGeometry(0.2, 0.15, 1);
  const supportArmMaterial = new THREE.MeshPhongMaterial({ color: 0x666666 });
  const supportArmMesh = new THREE.Mesh(supportArmGeometry, supportArmMaterial);
  
  // Position and rotate arm based on which side of court
  if (hoopPositionX < 0) {
    // Left hoop - arm points toward positive X (center)
    supportArmMesh.position.set(hoopPositionX + 0.5, 5, 0);
    supportArmMesh.rotation.y = degrees_to_radians(90);
  } else {
    // Right hoop - arm points toward negative X (center)
    supportArmMesh.position.set(hoopPositionX - 0.5, 5, 0);
    supportArmMesh.rotation.y = degrees_to_radians(-90);
  }
  
  supportArmMesh.castShadow = true;
  basketballHoopGroup.add(supportArmMesh);

  // CREATE TEXTURE LOADER FOR BACKBOARD
  const textureLoader = new THREE.TextureLoader();
  
  // BACKBOARD GEOMETRY
  const backboardGeometry = new THREE.BoxGeometry(2.8, 1.6, 0.1);
  
  // LOAD THE BASKETBALL BACKBOARD TEXTURE
  const backboardTexture = textureLoader.load(
    './src/textures/Basketball_Backboard.jpg',
    
    // Success callback
    function(texture) {
      console.log('Basketball backboard texture loaded successfully');
      
      // Optional: Adjust texture properties for better appearance
      texture.wrapS = THREE.ClampToEdgeWrapping;
      texture.wrapT = THREE.ClampToEdgeWrapping;
      
      // Uncomment and modify if the texture appears rotated or flipped
      // texture.rotation = Math.PI;
      // texture.center.set(0.5, 0.5);
      // texture.flipY = false;
    },
    
    // Progress callback
    function(progress) {
      console.log('Loading backboard texture: ' + Math.round(progress.loaded / progress.total * 100) + '%');
    },
    
    // Error callback
    function(error) {
      console.error('Failed to load basketball backboard texture:', error);
      console.log('Using fallback white material');
    }
  );
  
  // CREATE MATERIALS ARRAY - DIFFERENT MATERIAL FOR EACH FACE
  const backboardMaterials = [
    // Right face (+X)
    new THREE.MeshPhongMaterial({ color: 0xffffff, transparent: true, opacity: 0.8 }),
    // Left face (-X) 
    new THREE.MeshPhongMaterial({ color: 0xffffff, transparent: true, opacity: 0.8 }),
    // Top face (+Y)
    new THREE.MeshPhongMaterial({ color: 0xffffff, transparent: true, opacity: 0.8 }),
    // Bottom face (-Y)
    new THREE.MeshPhongMaterial({ color: 0xffffff, transparent: true, opacity: 0.8 }),
    // Front face (+Z) - THIS GETS THE TEXTURE
    new THREE.MeshPhongMaterial({ 
      map: backboardTexture, 
      transparent: true, 
      opacity: 0.9, 
      shininess: 20 
    }),
    // Back face (-Z)
    new THREE.MeshPhongMaterial({ color: 0xffffff, transparent: true, opacity: 0.8 })
  ];
  
  // CREATE BACKBOARD MESH WITH MATERIALS ARRAY
  const backboardMesh = new THREE.Mesh(backboardGeometry, backboardMaterials);

  // Position and rotate backboard based on which side of court
  if (hoopPositionX < 0) {
    // Left backboard faces toward positive X (center)
    backboardMesh.position.set(hoopPositionX + 1, 5, 0);
    backboardMesh.rotation.y = degrees_to_radians(90); // Rotate to face center
  } else {
    // Right backboard faces toward negative X (center)
    backboardMesh.position.set(hoopPositionX - 1, 5, 0);
    backboardMesh.rotation.y = degrees_to_radians(-90); // Rotate to face center
  }

  backboardMesh.castShadow = true;
  backboardMesh.receiveShadow = true;
  basketballHoopGroup.add(backboardMesh);
  
  scene.add(basketballHoopGroup);

  // Basketball rim (orange color at regulation height) - 3D version
  const basketballRimGeometry = new THREE.TorusGeometry(0.23, 0.02, 8, 16);
  const basketballRimMaterial = new THREE.MeshPhongMaterial({ color: 0xff6600 });
  const basketballRimMesh = new THREE.Mesh(basketballRimGeometry, basketballRimMaterial);

  // Position rim in front of backboard, facing upward
  basketballRimMesh.rotation.x = degrees_to_radians(-90); // Make it horizontal

  if (hoopPositionX < 0) {
    // Left rim - positioned in front of left backboard
    basketballRimMesh.position.set(hoopPositionX + 1.3, 4.5, 0);
  } else {
    // Right rim - positioned in front of right backboard  
    basketballRimMesh.position.set(hoopPositionX - 1.3, 4.5, 0);
  }

  basketballRimMesh.castShadow = true;
  basketballHoopGroup.add(basketballRimMesh);

  // Basketball net using line segments (12 vertical lines + horizontal lines)
  const basketballNetGroup = new THREE.Group();
  const numberOfNetSegments = 12;
  const netLineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });

  // Create 12 vertical lines
  for (let segmentIndex = 0; segmentIndex < numberOfNetSegments; segmentIndex++) {
    const segmentAngle = (segmentIndex / numberOfNetSegments) * Math.PI * 2;
    const rimTopX = Math.cos(segmentAngle) * 0.23;
    const rimTopZ = Math.sin(segmentAngle) * 0.23;
    const netBottomX = Math.cos(segmentAngle) * 0.15;
    const netBottomZ = Math.sin(segmentAngle) * 0.15;
    
    // Create vertical line segment from rim to bottom of net
    const verticalNetPoints = [
      new THREE.Vector3(rimTopX, 0, rimTopZ),
      new THREE.Vector3(netBottomX, -0.4, netBottomZ)
    ];
    
    const verticalNetGeometry = new THREE.BufferGeometry().setFromPoints(verticalNetPoints);
    const verticalNetLine = new THREE.Line(verticalNetGeometry, netLineMaterial);
    basketballNetGroup.add(verticalNetLine);
  }

  // Create horizontal lines (3 levels)
  const horizontalLevels = [-0.1, -0.25, -0.35];
  
  for (let levelIndex = 0; levelIndex < horizontalLevels.length; levelIndex++) {
    const yLevel = horizontalLevels[levelIndex];
    const radiusAtLevel = 0.23 - (Math.abs(yLevel) * 0.2); // Gradually smaller radius
    
    for (let segmentIndex = 0; segmentIndex < numberOfNetSegments; segmentIndex++) {
      const angle1 = (segmentIndex / numberOfNetSegments) * Math.PI * 2;
      const angle2 = ((segmentIndex + 1) / numberOfNetSegments) * Math.PI * 2;
      
      const x1 = Math.cos(angle1) * radiusAtLevel;
      const z1 = Math.sin(angle1) * radiusAtLevel;
      const x2 = Math.cos(angle2) * radiusAtLevel;
      const z2 = Math.sin(angle2) * radiusAtLevel;
      
      // Create horizontal line segment
      const horizontalNetPoints = [
        new THREE.Vector3(x1, yLevel, z1),
        new THREE.Vector3(x2, yLevel, z2)
      ];
      
      const horizontalNetGeometry = new THREE.BufferGeometry().setFromPoints(horizontalNetPoints);
      const horizontalNetLine = new THREE.Line(horizontalNetGeometry, netLineMaterial);
      basketballNetGroup.add(horizontalNetLine);
    }
  }

  // Position the entire net group under the rim
  if (hoopPositionX < 0) {
    basketballNetGroup.position.set(hoopPositionX + 1.3, 4.5, 0);
  } else {
    basketballNetGroup.position.set(hoopPositionX - 1.3, 4.5, 0);
  }

  basketballHoopGroup.add(basketballNetGroup);
}


// Create basketball with your custom texture
function createBasketball() {
  // Create texture loader
  const textureLoader = new THREE.TextureLoader();
  
  // Basketball geometry (higher segments for smoother appearance with texture)
  const basketballGeometry = new THREE.SphereGeometry(0.12, 64, 64);
  
  // Load your basketball texture
  const basketballTexture = textureLoader.load(
    './src/textures/basketball.png',  // Path to your texture file
    
    // Success callback
    function(texture) {
      console.log('Basketball texture loaded successfully');
      
      // Optional: Adjust texture properties for better appearance
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      
      // You might need to adjust these values based on how the texture looks
      // texture.repeat.set(1, 1);  // Use this if texture appears too stretched
      // texture.offset.set(0, 0);  // Use this to adjust texture positioning
    },
    
    // Progress callback
    function(progress) {
      console.log('Loading basketball texture: ' + Math.round(progress.loaded / progress.total * 100) + '%');
    },
    
    // Error callback - fallback to simple orange if texture fails
    function(error) {
      console.error('Failed to load basketball texture:', error);
      console.log('Using fallback orange material');
      
      // Fallback to simple orange material
      basketballMesh.material = new THREE.MeshPhongMaterial({ 
        color: 0xff6600,
        shininess: 30
      });
    }
  );
  
  // Basketball material with your texture
  const basketballMaterial = new THREE.MeshPhongMaterial({ 
    map: basketballTexture,
    shininess: 20,      // Slight shine for realistic basketball appearance
    bumpScale: 0.1      // Optional: adds slight surface bumps for texture
  });
  
  // Create basketball mesh
  const basketballMesh = new THREE.Mesh(basketballGeometry, basketballMaterial);
  basketballMesh.castShadow = true;
  basketballMesh.receiveShadow = true;
  
  // Position basketball at center court, slightly above the ground
  basketballMesh.position.set(0, 0.25, 0); // x=0 (center), y=0.25 (above court), z=0 (center)
  
  // Optional: Rotate basketball to get best seam line positioning
  basketballMesh.rotation.y = Math.PI / 4; // Rotate 45 degrees if needed
  
  // Add to scene
  scene.add(basketballMesh);
}


// Create all elements
createBasketballCourt();
createBasketballHoop(-15);  // Left hoop (matching three-point line position)
createBasketballHoop(15);   // Right hoop (matching three-point line position)
createBasketball();

// Set camera position for better view
const cameraTranslate = new THREE.Matrix4();
cameraTranslate.makeTranslation(0, 15, 30);
camera.applyMatrix4(cameraTranslate);

// Orbit controls
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
instructionsElement.innerHTML = `
  <h3>Controls:</h3>
  <p>O - Toggle orbit camera</p>
`;
document.body.appendChild(instructionsElement);

// Handle key events
function handleKeyDown(e) {
  if (e.key === "o") {
    isOrbitEnabled = !isOrbitEnabled;
  }
}

document.addEventListener('keydown', handleKeyDown);

// Animation function
function animate() {
  requestAnimationFrame(animate);
  
  // Update controls
  controls.enabled = isOrbitEnabled;
  controls.update();
  
  renderer.render(scene, camera);
}

animate();