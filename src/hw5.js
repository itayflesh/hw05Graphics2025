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

// ============================================================================
// HW6 - ENHANCED GAME STATE WITH BASKETBALL STATE MANAGEMENT
// ============================================================================

const gameState = {
  basketball: {
    position: { x: 0, y: 0.25, z: 0 },
    velocity: { x: 0, y: 0, z: 0 },
    targetPosition: { x: 0, y: 0.25, z: 0 },
    previousPosition: { x: 0, y: 0.25, z: 0 },
    isInFlight: false,
    isOnGround: true,
    isMoving: false,
    rotation: { x: 0, y: 0, z: 0 },
    rotationVelocity: { x: 0, y: 0, z: 0 },
    movementSpeed: 8.0,
    radius: 0.12
  },
  shotPower: 50,
  minPower: 0,
  maxPower: 100,
  powerStep: 1,
  lastPowerAdjustment: 0,
  score: 0,
  shotAttempts: 0,
  shotsMade: 0,
  courtBounds: {
    minX: -14.5,
    maxX: 14.5,
    minZ: -7.0,
    maxZ: 7.0,
    groundY: 0.25,
    maxY: 15.0
  },
  deltaTime: 0,
  lastTime: 0
};

// Input state tracking
const inputState = {
  arrowLeft: false,
  arrowRight: false,
  arrowUp: false,
  arrowDown: false,
  keyW: false,
  keyS: false,
  spacebar: false,
  keyR: false,
  keyO: false
};

let basketballGroup = null;

// ============================================================================
// BASKETBALL STATE MANAGER CLASS
// ============================================================================

class BasketballStateManager {
  constructor() {
    this.lastUpdateTime = performance.now();
  }
  
  updateState(currentTime) {
    gameState.deltaTime = (currentTime - this.lastUpdateTime) / 1000;
    this.lastUpdateTime = currentTime;
    gameState.deltaTime = Math.min(gameState.deltaTime, 1/30);
    
    this.updatePosition();
    this.updateVisualPosition();
  }
  
  updatePosition() {
    const ball = gameState.basketball;
    
    if (!ball.targetPosition) {
      ball.targetPosition = { ...ball.position };
    }
    
    const dx = ball.targetPosition.x - ball.position.x;
    const dy = ball.targetPosition.y - ball.position.y;
    const dz = ball.targetPosition.z - ball.position.z;
    
    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
    
    if (distance > 0.01) {
      ball.isMoving = true;
      const factor = 1 - Math.exp(-8.0 * gameState.deltaTime);
      
      // Store previous position for movement calculations
      ball.previousPosition = { ...ball.position };
      
      ball.position.x += dx * factor;
      ball.position.y += dy * factor;
      ball.position.z += dz * factor;
      
      // Update velocity for future physics calculations
      ball.velocity.x = (ball.position.x - ball.previousPosition.x) / gameState.deltaTime;
      ball.velocity.z = (ball.position.z - ball.previousPosition.z) / gameState.deltaTime;
    } else {
      ball.position.x = ball.targetPosition.x;
      ball.position.y = ball.targetPosition.y;
      ball.position.z = ball.targetPosition.z;
      ball.isMoving = false;
      ball.velocity.x = 0;
      ball.velocity.z = 0;
    }
  }
  
  updateVisualPosition() {
    if (basketballGroup) {
      basketballGroup.position.set(
        gameState.basketball.position.x,
        gameState.basketball.position.y,
        gameState.basketball.position.z
      );
    }
  }
  
  setTargetPosition(x, y, z) {
    if (!gameState.basketball.isInFlight) {
      // Validate position is within court bounds
      const bounds = gameState.courtBounds;
      x = Math.max(bounds.minX, Math.min(bounds.maxX, x));
      z = Math.max(bounds.minZ, Math.min(bounds.maxZ, z));
      
      gameState.basketball.targetPosition = { x, y, z };
      console.log(`Setting target position: (${x.toFixed(2)}, ${y.toFixed(2)}, ${z.toFixed(2)})`);
    }
  }
  
  resetToCenter() {
    console.log('Resetting basketball to center court with smooth animation');
    gameState.basketball.isInFlight = false;
    gameState.basketball.isOnGround = true;
    gameState.basketball.velocity = { x: 0, y: 0, z: 0 };
    gameState.basketball.rotation = { x: 0, y: 0, z: 0 };
    this.setTargetPosition(0, gameState.courtBounds.groundY, 0);
    gameState.shotPower = 50;
  }
  
  getStateInfo() {
    const ball = gameState.basketball;
    return {
      position: { ...ball.position },
      targetPosition: ball.targetPosition ? { ...ball.targetPosition } : null,
      isMoving: ball.isMoving || false,
      isInFlight: ball.isInFlight,
      isOnGround: ball.isOnGround,
      shotPower: gameState.shotPower,
      velocity: { ...ball.velocity }
    };
  }
}

const basketballStateManager = new BasketballStateManager();

console.log('Basketball state manager created in hw5.js!');

// ============================================================================
// PHASE 3: SHOT POWER SYSTEM FUNCTIONS
// ============================================================================

/**
 * Enhanced shot power adjustment with visual feedback
 * @param {number} delta - Amount to change power by (positive or negative)
 */
function adjustShotPower(delta) {
  const oldPower = gameState.shotPower;
  gameState.shotPower = Math.max(gameState.minPower, 
                                Math.min(gameState.maxPower, 
                                        gameState.shotPower + delta));
  
  // Only log and update UI if power actually changed
  if (gameState.shotPower !== oldPower) {
    console.log(`Shot power adjusted: ${oldPower} -> ${gameState.shotPower}%`);
    updatePowerDisplay();
    
    // Visual feedback for power changes
    showPowerChangeMessage(gameState.shotPower > oldPower ? 'increase' : 'decrease');
  }
}

/**
 * Update power display in UI with real-time visual indicator
 */
function updatePowerDisplay() {
  // Update the existing power display element
  const powerElement = document.getElementById('power-indicator');
  if (powerElement) {
    powerElement.textContent = `${gameState.shotPower}%`;
    
    // Add visual styling based on power level
    powerElement.className = 'power-value';
    if (gameState.shotPower < 25) {
      powerElement.classList.add('power-low');
    } else if (gameState.shotPower > 75) {
      powerElement.classList.add('power-high');
    } else {
      powerElement.classList.add('power-medium');
    }
  }
  
  // Update power bar visual
  const powerBar = document.getElementById('power-bar-fill');
  if (powerBar) {
    const percentage = (gameState.shotPower / gameState.maxPower) * 100;
    powerBar.style.width = `${percentage}%`;
    
    // Change color based on power level
    if (gameState.shotPower < 25) {
      powerBar.style.backgroundColor = '#ff4444'; // Red for low power
    } else if (gameState.shotPower > 75) {
      powerBar.style.backgroundColor = '#44ff44'; // Green for high power
    } else {
      powerBar.style.backgroundColor = '#ffaa00'; // Orange for medium power
    }
  }
  
  console.log(`Power display updated: ${gameState.shotPower}%`);
}

/**
 * Show temporary visual feedback for power changes
 * @param {string} direction - 'increase' or 'decrease'
 */
function showPowerChangeMessage(direction) {
  const messageElement = document.getElementById('power-change-message');
  if (messageElement) {
    messageElement.textContent = direction === 'increase' ? 'Power ↑' : 'Power ↓';
    messageElement.className = `power-change-message ${direction}`;
    messageElement.style.opacity = '1';
    
    // Fade out after a short delay
    setTimeout(() => {
      messageElement.style.opacity = '0';
    }, 500);
  }
}

/**
 * Create enhanced power indicator UI elements
 * Call this function during initialization
 */
function createPowerIndicatorUI() {
  console.log('Creating enhanced power indicator UI...');
  
  // Find the controls display panel
  const controlsDisplay = document.getElementById('controls-display');
  if (!controlsDisplay) {
    console.error('Controls display element not found!');
    return;
  }
  
  // Create power control section
  const powerSection = document.createElement('div');
  powerSection.className = 'control-section power-section';
  powerSection.innerHTML = `
    <div class="control-section-title">Shot Power</div>
    <div class="power-display">
      <div class="power-bar-container">
        <div class="power-bar-background">
          <div id="power-bar-fill" class="power-bar-fill"></div>
        </div>
        <div class="power-percentage">
          <span id="power-indicator" class="power-value">${gameState.shotPower}%</span>
        </div>
      </div>
      <div class="power-controls">
        <div class="control-group">
          <span class="control-key">W</span>
          <span class="control-description">Increase power</span>
        </div>
        <div class="control-group">
          <span class="control-key">S</span>
          <span class="control-description">Decrease power</span>
        </div>
      </div>
      <div id="power-change-message" class="power-change-message"></div>
    </div>
  `;
  
  // Insert power section at the beginning of controls (after camera section)
  const cameraSection = controlsDisplay.querySelector('.control-section:first-child');
  if (cameraSection && cameraSection.nextSibling) {
    controlsDisplay.insertBefore(powerSection, cameraSection.nextSibling);
  } else {
    controlsDisplay.appendChild(powerSection);
  }
  
  // Enable the W/S controls (remove disabled state)
  const basketballActions = controlsDisplay.querySelector('.control-section.control-disabled');
  if (basketballActions) {
    // Check if this section contains W/S keys
    const hasWKey = basketballActions.innerHTML.includes('>W<');
    const hasSKey = basketballActions.innerHTML.includes('>S<');
    
    if (hasWKey || hasSKey) {
      // Remove disabled class only from W/S controls within this section
      const controlGroups = basketballActions.querySelectorAll('.control-group');
      controlGroups.forEach(group => {
        const keyElement = group.querySelector('.control-key');
        if (keyElement && (keyElement.textContent === 'W' || keyElement.textContent === 'S')) {
          group.classList.remove('control-disabled');
          group.style.opacity = '1';
        }
      });
    }
  }
  
  // Initialize power display
  updatePowerDisplay();
  
  console.log('Power indicator UI created successfully');
}

/**
 * Enhanced power adjustment processing with smooth power changes
 * Replace the existing power adjustment logic in processInput()
 */
function processEnhancedPowerInput() {
  // Shot power adjustment with rate limiting for smooth control
  const powerAdjustmentRate = 60; // Adjustments per second
  const timeSinceLastAdjustment = performance.now() - (gameState.lastPowerAdjustment || 0);
  const adjustmentInterval = 1000 / powerAdjustmentRate;
  
  if (timeSinceLastAdjustment >= adjustmentInterval) {
    if (inputState.keyW) {
      adjustShotPower(gameState.powerStep);
      gameState.lastPowerAdjustment = performance.now();
    }
    if (inputState.keyS) {
      adjustShotPower(-gameState.powerStep);
      gameState.lastPowerAdjustment = performance.now();
    }
  }
}

/**
 * Initialize the complete Phase 3 power system
 * Call this function after your existing initialization
 */
function initializePowerSystem() {
  console.log('Initializing Phase 3: Shot Power System...');
  
  // Add missing properties to gameState if they don't exist
  if (!gameState.hasOwnProperty('lastPowerAdjustment')) {
    gameState.lastPowerAdjustment = 0;
  }
  
  // Create the power indicator UI
  createPowerIndicatorUI();
  
  console.log('Phase 3: Shot Power System initialized successfully!');
  console.log('Features implemented:');
  console.log('- W/S keys for smooth power adjustment');
  console.log('- Real-time visual power indicator');
  console.log('- Power bar with color coding');
  console.log('- Visual feedback for power changes');
}

// ============================================================================
// PHASE 4: PHYSICS ENGINE IMPLEMENTATION
// Add this code to your hw5.js file after the existing Phase 3 code
// ============================================================================

// Physics constants and configuration
const PHYSICS_CONFIG = {
  gravity: -9.8,        // Gravity acceleration (m/s²)
  scaledGravity: -19.6, // Scaled for the scene (2x for more dramatic effect)
  groundFriction: 0.8,  // Friction when ball is on ground
  airResistance: 0.99,  // Air resistance multiplier (0.99 = 1% resistance)
  bounceDamping: 0.7,   // Energy loss on bounce (0.7 = 30% energy loss)
  minBounceVelocity: 1.0, // Minimum velocity to trigger bounce
  restingThreshold: 0.1   // Velocity below which ball is considered at rest
};

// Enhanced game state for physics
const physicsState = {
  isPhysicsActive: false,
  groundLevel: 0.25,     // Y coordinate of ground + ball radius
  timeScale: 1.0,        // For slow motion effects if needed
  lastCollisionTime: 0,  // Prevent collision spam
  debugMode: false       // For physics debugging
};

// Collision detection system
class CollisionDetector {
  constructor() {
    this.ballRadius = gameState.basketball.radius;
    this.courtBounds = gameState.courtBounds;
  }
  
  /**
   * Check collision with ground
   * @param {Object} position - Current ball position
   * @param {Object} velocity - Current ball velocity
   * @returns {Object} Collision result with isColliding and normal
   */
  checkGroundCollision(position, velocity) {
    const collision = {
      isColliding: false,
      normal: { x: 0, y: 1, z: 0 }, // Ground normal points up
      penetration: 0
    };
    
    // Check if ball is at or below ground level
    if (position.y <= physicsState.groundLevel) {
      collision.isColliding = true;
      collision.penetration = physicsState.groundLevel - position.y;
      
      if (physicsState.debugMode) {
        console.log(`Ground collision detected at y=${position.y.toFixed(3)}, penetration=${collision.penetration.toFixed(3)}`);
      }
    }
    
    return collision;
  }
  
  /**
   * Check collision with court boundaries (walls)
   * @param {Object} position - Current ball position
   * @param {Object} velocity - Current ball velocity
   * @returns {Object} Collision result
   */
  checkBoundaryCollision(position, velocity) {
    const collision = {
      isColliding: false,
      normal: { x: 0, y: 0, z: 0 },
      penetration: 0
    };
    
    const bounds = this.courtBounds;
    const radius = this.ballRadius;
    
    // Check X boundaries (left/right walls)
    if (position.x - radius <= bounds.minX) {
      collision.isColliding = true;
      collision.normal = { x: 1, y: 0, z: 0 }; // Normal points right
      collision.penetration = bounds.minX - (position.x - radius);
    } else if (position.x + radius >= bounds.maxX) {
      collision.isColliding = true;
      collision.normal = { x: -1, y: 0, z: 0 }; // Normal points left
      collision.penetration = (position.x + radius) - bounds.maxX;
    }
    
    // Check Z boundaries (front/back walls)
    if (position.z - radius <= bounds.minZ) {
      collision.isColliding = true;
      collision.normal = { x: 0, y: 0, z: 1 }; // Normal points forward
      collision.penetration = bounds.minZ - (position.z - radius);
    } else if (position.z + radius >= bounds.maxZ) {
      collision.isColliding = true;
      collision.normal = { x: 0, y: 0, z: -1 }; // Normal points backward
      collision.penetration = (position.z + radius) - bounds.maxZ;
    }
    
    if (collision.isColliding && physicsState.debugMode) {
      console.log(`Boundary collision detected at (${position.x.toFixed(2)}, ${position.z.toFixed(2)})`);
    }
    
    return collision;
  }
  
  /**
   * Check all collision types
   * @param {Object} position - Current ball position
   * @param {Object} velocity - Current ball velocity
   * @returns {Array} Array of collision results
   */
  checkAllCollisions(position, velocity) {
    const collisions = [];
    
    // Check ground collision
    const groundCollision = this.checkGroundCollision(position, velocity);
    if (groundCollision.isColliding) {
      collisions.push({ type: 'ground', ...groundCollision });
    }
    
    // Check boundary collisions
    const boundaryCollision = this.checkBoundaryCollision(position, velocity);
    if (boundaryCollision.isColliding) {
      collisions.push({ type: 'boundary', ...boundaryCollision });
    }
    
    return collisions;
  }
}

// Physics engine class
class BasketballPhysicsEngine {
  constructor() {
    this.collisionDetector = new CollisionDetector();
    this.isActive = false;
  }
  
  /**
   * Start physics simulation for the basketball
   * @param {Object} initialVelocity - Starting velocity {x, y, z}
   */
  startPhysics(initialVelocity) {
    console.log('Starting physics simulation with velocity:', initialVelocity);
    
    const ball = gameState.basketball;
    
    // Set physics state
    ball.velocity = { ...initialVelocity };
    ball.isInFlight = true;
    ball.isOnGround = false;
    physicsState.isPhysicsActive = true;
    this.isActive = true;
    
    console.log('Physics simulation started');
  }
  
  /**
   * Stop physics simulation
   */
  stopPhysics() {
    const ball = gameState.basketball;
    
    ball.velocity = { x: 0, y: 0, z: 0 };
    ball.isInFlight = false;
    ball.isOnGround = true;
    physicsState.isPhysicsActive = false;
    this.isActive = false;
    
    console.log('Physics simulation stopped');
  }
  
  /**
   * Apply gravity to the basketball
   * @param {number} deltaTime - Time since last update
   */
  applyGravity(deltaTime) {
    if (!physicsState.isPhysicsActive) return;
    
    const ball = gameState.basketball;
    
    // Apply gravity to Y velocity
    ball.velocity.y += PHYSICS_CONFIG.scaledGravity * deltaTime;
    
    // Apply air resistance to all velocity components
    const resistance = Math.pow(PHYSICS_CONFIG.airResistance, deltaTime * 60);
    ball.velocity.x *= resistance;
    ball.velocity.z *= resistance;
    // Note: Don't apply air resistance to Y velocity as much (gravity dominates)
    ball.velocity.y *= Math.pow(0.995, deltaTime * 60);
  }
  
  /**
   * Update position based on velocity
   * @param {number} deltaTime - Time since last update
   */
  updatePosition(deltaTime) {
    if (!physicsState.isPhysicsActive) return;
    
    const ball = gameState.basketball;
    
    // Store previous position for collision resolution
    ball.previousPosition = { ...ball.position };
    
    // Update position using velocity (Euler integration)
    ball.position.x += ball.velocity.x * deltaTime;
    ball.position.y += ball.velocity.y * deltaTime;
    ball.position.z += ball.velocity.z * deltaTime;
    
    // Update target position to match physics position
    ball.targetPosition = { ...ball.position };
  }
  
  /**
   * Handle collision response
   * @param {Array} collisions - Array of collision data
   */
  handleCollisions(collisions) {
    if (collisions.length === 0) return;
    
    const ball = gameState.basketball;
    const currentTime = performance.now();
    
    // Prevent collision spam
    if (currentTime - physicsState.lastCollisionTime < 50) return;
    
    for (const collision of collisions) {
      this.resolveCollision(collision);
    }
    
    physicsState.lastCollisionTime = currentTime;
  }
  
  /**
   * Resolve a single collision
   * @param {Object} collision - Collision data
   */
  resolveCollision(collision) {
    const ball = gameState.basketball;
    const { normal, penetration, type } = collision;
    
    // Move ball out of penetration
    if (penetration > 0) {
      ball.position.x += normal.x * penetration;
      ball.position.y += normal.y * penetration;
      ball.position.z += normal.z * penetration;
    }
    
    // Calculate velocity reflection
    const dotProduct = ball.velocity.x * normal.x + 
                      ball.velocity.y * normal.y + 
                      ball.velocity.z * normal.z;
    
    if (dotProduct < 0) { // Only reflect if moving toward surface
      // Reflect velocity
      ball.velocity.x -= 2 * dotProduct * normal.x;
      ball.velocity.y -= 2 * dotProduct * normal.y;
      ball.velocity.z -= 2 * dotProduct * normal.z;
      
      // Apply bounce damping based on collision type
      let damping = PHYSICS_CONFIG.bounceDamping;
      
      if (type === 'ground') {
        // More damping for ground bounces
        damping = PHYSICS_CONFIG.bounceDamping * 0.8;
        
        // Set on ground if velocity is low enough
        if (Math.abs(ball.velocity.y) < PHYSICS_CONFIG.minBounceVelocity) {
          ball.velocity.y = 0;
          ball.position.y = physicsState.groundLevel;
          ball.isOnGround = true;
          
          // Apply ground friction to horizontal movement
          ball.velocity.x *= PHYSICS_CONFIG.groundFriction;
          ball.velocity.z *= PHYSICS_CONFIG.groundFriction;
          
          console.log('Ball settled on ground');
          
          // Check if ball should stop completely
          const horizontalSpeed = Math.sqrt(ball.velocity.x ** 2 + ball.velocity.z ** 2);
          if (horizontalSpeed < PHYSICS_CONFIG.restingThreshold) {
            this.stopPhysics();
            return;
          }
        }
      }
      
      // Apply damping to all velocity components
      ball.velocity.x *= damping;
      ball.velocity.y *= damping;
      ball.velocity.z *= damping;
      
      console.log(`${type} collision resolved, new velocity:`, ball.velocity);
    }
  }
  
  /**
   * Update basketball rotation based on velocity
   * @param {number} deltaTime - Time since last update
   */
  updateRotationFromVelocity(deltaTime) {
    if (!physicsState.isPhysicsActive) return;
    
    const ball = gameState.basketball;
    const rotationFactor = 0.05; // Adjust for rotation speed
    
    // Calculate rotation based on velocity
    ball.rotationVelocity.x = -ball.velocity.z * rotationFactor;
    ball.rotationVelocity.z = ball.velocity.x * rotationFactor;
    
    // Apply rotation
    ball.rotation.x += ball.rotationVelocity.x * deltaTime;
    ball.rotation.z += ball.rotationVelocity.z * deltaTime;
    
    // Update visual rotation
    if (basketballGroup) {
      basketballGroup.rotation.x = ball.rotation.x;
      basketballGroup.rotation.z = ball.rotation.z;
      basketballGroup.rotation.y = Math.PI / 6 + ball.rotation.y;
    }
  }
  
  /**
   * Main physics update function
   * @param {number} deltaTime - Time since last update
   */
  update(deltaTime) {
    if (!this.isActive) return;
    
    // Apply physics forces
    this.applyGravity(deltaTime);
    
    // Update position
    this.updatePosition(deltaTime);
    
    // Check for collisions
    const collisions = this.collisionDetector.checkAllCollisions(
      gameState.basketball.position, 
      gameState.basketball.velocity
    );
    
    // Handle collisions
    this.handleCollisions(collisions);
    
    // Update rotation
    this.updateRotationFromVelocity(deltaTime);
    
    // Debug output
    if (physicsState.debugMode && Math.random() < 0.1) { // 10% chance per frame
      const ball = gameState.basketball;
      console.log(`Physics update - Pos: (${ball.position.x.toFixed(2)}, ${ball.position.y.toFixed(2)}, ${ball.position.z.toFixed(2)}), Vel: (${ball.velocity.x.toFixed(2)}, ${ball.velocity.y.toFixed(2)}, ${ball.velocity.z.toFixed(2)})`);
    }
  }
  
  /**
   * Calculate trajectory for a shot
   * @param {Object} startPos - Starting position
   * @param {Object} targetPos - Target position (hoop)
   * @param {number} power - Shot power (0-100)
   * @returns {Object} Initial velocity vector
   */
  calculateTrajectory(startPos, targetPos, power) {
    // Calculate distance and direction
    const dx = targetPos.x - startPos.x;
    const dy = targetPos.y - startPos.y;
    const dz = targetPos.z - startPos.z;
    const horizontalDistance = Math.sqrt(dx * dx + dz * dz);
    
    // Convert power (0-100) to velocity multiplier
    const powerMultiplier = 0.3 + (power / 100) * 0.7; // Range: 0.3 to 1.0
    const baseVelocity = 20; // Base shot velocity
    const totalVelocity = baseVelocity * powerMultiplier;
    
    // Calculate optimal angle for trajectory (45 degrees adjusted for target height)
    const optimalAngle = Math.atan2(dy + 2, horizontalDistance) + Math.PI / 6; // Add arc
    
    // Calculate velocity components
    const horizontalVel = totalVelocity * Math.cos(optimalAngle);
    const verticalVel = totalVelocity * Math.sin(optimalAngle);
    
    // Direction vector for horizontal components
    const direction = {
      x: dx / horizontalDistance,
      z: dz / horizontalDistance
    };
    
    return {
      x: direction.x * horizontalVel,
      y: verticalVel,
      z: direction.z * horizontalVel
    };
  }
  
  /**
   * Test physics with a simple drop
   */
  testDrop() {
    console.log('Testing physics with simple drop');
    
    // Position ball higher for testing
    gameState.basketball.position.y = 5;
    gameState.basketball.targetPosition.y = 5;
    
    // Start physics with zero horizontal velocity
    this.startPhysics({ x: 0, y: 0, z: 0 });
  }
  
  /**
   * Test physics with a bounce
   */
  testBounce() {
    console.log('Testing physics with bounce');
    
    // Position ball higher and give it some initial velocity
    gameState.basketball.position.y = 3;
    gameState.basketball.targetPosition.y = 3;
    
    // Start physics with downward and slight horizontal velocity
    this.startPhysics({ x: 2, y: -5, z: 1 });
  }
}

// Create global physics engine instance
const basketballPhysics = new BasketballPhysicsEngine();

// ============================================================================
// INTEGRATION WITH EXISTING SYSTEMS
// ============================================================================

/**
 * Enhanced BasketballStateManager to include physics
 */
class EnhancedBasketballStateManager extends BasketballStateManager {
  updateState(currentTime) {
    gameState.deltaTime = (currentTime - this.lastUpdateTime) / 1000;
    this.lastUpdateTime = currentTime;
    gameState.deltaTime = Math.min(gameState.deltaTime, 1/30);
    
    // Update physics if active
    if (physicsState.isPhysicsActive) {
      basketballPhysics.update(gameState.deltaTime);
    } else {
      // Use the original smooth movement when physics is not active
      this.updatePosition();
    }
    
    this.updateVisualPosition();
  }
  
  startPhysics(initialVelocity) {
    basketballPhysics.startPhysics(initialVelocity);
  }
  
  stopPhysics() {
    basketballPhysics.stopPhysics();
  }
}

// ============================================================================
// PHYSICS DEBUG CONTROLS
// ============================================================================

/**
 * Add physics debug controls
 */
function initializePhysicsDebugControls() {
  // Add debug key handlers to existing handleKeyDown function
  const originalHandleKeyDown = handleKeyDown;
  
  window.handleKeyDown = function(event) {
    // Call original handler first
    originalHandleKeyDown(event);
    
    // Add physics debug controls
    switch (event.code) {
      case 'KeyP':
        console.log('P pressed - Testing physics drop');
        basketballPhysics.testDrop();
        break;
      case 'KeyB':
        console.log('B pressed - Testing physics bounce');
        basketballPhysics.testBounce();
        break;
      case 'KeyG':
        physicsState.debugMode = !physicsState.debugMode;
        console.log('G pressed - Physics debug mode:', physicsState.debugMode);
        break;
    }
  };
  
  // Replace the old handler
  document.removeEventListener('keydown', handleKeyDown);
  document.addEventListener('keydown', window.handleKeyDown);
}

/**
 * Initialize Phase 4 physics system
 */
function initializePhysicsEngine() {
  console.log('Initializing Phase 4: Physics Engine...');
  
  // Replace the old state manager with enhanced version
  // Note: You'll need to update the global reference in your main code
  
  // Initialize physics debug controls
  initializePhysicsDebugControls();
  
  console.log('Phase 4: Physics Engine initialized successfully!');
  console.log('Features implemented:');
  console.log('- Gravity simulation with realistic acceleration');
  console.log('- Ground and boundary collision detection');
  console.log('- Bounce mechanics with energy loss');
  console.log('- Rotation based on velocity');
  console.log('- Air resistance and friction');
  console.log('Debug controls:');
  console.log('- P key: Test physics drop');
  console.log('- B key: Test physics bounce');
  console.log('- G key: Toggle debug mode');
}

// ============================================================================
// INPUT HANDLING FUNCTIONS
// ============================================================================

/**
 * Handle key down events
 * @param {KeyboardEvent} event - The keyboard event
 */
function handleKeyDown(event) {
  // Prevent default browser behavior for game keys
  const gameKeys = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'KeyW', 'KeyS', ' ', 'KeyR', 'KeyO'];
  if (gameKeys.includes(event.code) || gameKeys.includes(event.key)) {
    event.preventDefault();
  }
  
  // Update input state based on key pressed
  switch (event.code) {
    // Arrow keys for basketball movement
    case 'ArrowLeft':
      inputState.arrowLeft = true;
      console.log('Arrow Left pressed - Move ball left');
      break;
    case 'ArrowRight':
      inputState.arrowRight = true;
      console.log('Arrow Right pressed - Move ball right');
      break;
    case 'ArrowUp':
      inputState.arrowUp = true;
      console.log('Arrow Up pressed - Move ball forward');
      break;
    case 'ArrowDown':
      inputState.arrowDown = true;
      console.log('Arrow Down pressed - Move ball backward');
      break;
    
    // W/S keys for shot power adjustment
    case 'KeyW':
      inputState.keyW = true;
      console.log('W pressed - Increase shot power');
      break;
    case 'KeyS':
      inputState.keyS = true;
      console.log('S pressed - Decrease shot power');
      break;
    
    // Action keys
    case 'Space':
      inputState.spacebar = true;
      console.log('Spacebar pressed - Shoot basketball');
      break;
    case 'KeyR':
      inputState.keyR = true;
      console.log('R pressed - Reset basketball position');
      break;
    
    // Camera toggle (existing functionality)
    case 'KeyO':
      inputState.keyO = true;
      // Toggle orbit camera controls on/off
      isOrbitEnabled = !isOrbitEnabled;
      console.log('O pressed - Toggle orbit camera:', isOrbitEnabled);
      break;
  }
}

/**
 * Handle key up events
 * @param {KeyboardEvent} event - The keyboard event
 */
function handleKeyUp(event) {
  // Update input state based on key released
  switch (event.code) {
    // Arrow keys for basketball movement
    case 'ArrowLeft':
      inputState.arrowLeft = false;
      break;
    case 'ArrowRight':
      inputState.arrowRight = false;
      break;
    case 'ArrowUp':
      inputState.arrowUp = false;
      break;
    case 'ArrowDown':
      inputState.arrowDown = false;
      break;
    
    // W/S keys for shot power adjustment
    case 'KeyW':
      inputState.keyW = false;
      break;
    case 'KeyS':
      inputState.keyS = false;
      break;
    
    // Action keys
    case 'Space':
      inputState.spacebar = false;
      break;
    case 'KeyR':
      inputState.keyR = false;
      break;
    
    // Camera toggle
    case 'KeyO':
      inputState.keyO = false;
      break;
  }
}

/**
 * Process continuous input (called every frame)
 * This handles keys that should trigger continuous actions while held down
 */
function processInput() {
  // Only process input if basketball is not currently in flight
  if (!gameState.basketball.isInFlight) {
    
    // Basketball movement (continuous while keys are held)
    if (inputState.arrowLeft || inputState.arrowRight || 
        inputState.arrowUp || inputState.arrowDown) {
      
      console.log('Processing basketball movement input');
      
      // Calculate movement delta based on frame time for smooth movement
      const movementSpeed = gameState.basketball.movementSpeed;
      const deltaMovement = movementSpeed * gameState.deltaTime;
      
      // Get current target position (or current position if no target set)
      let newX = gameState.basketball.targetPosition ? 
                 gameState.basketball.targetPosition.x : 
                 gameState.basketball.position.x;
      let newZ = gameState.basketball.targetPosition ? 
                 gameState.basketball.targetPosition.z : 
                 gameState.basketball.position.z;
      
      // Apply movement based on input
      if (inputState.arrowLeft) {
        newX -= deltaMovement;
        console.log(`Moving left: newX = ${newX.toFixed(2)}`);
      }
      if (inputState.arrowRight) {
        newX += deltaMovement;
        console.log(`Moving right: newX = ${newX.toFixed(2)}`);
      }
      if (inputState.arrowUp) {
        newZ -= deltaMovement; // Negative Z is forward on the court
        console.log(`Moving forward: newZ = ${newZ.toFixed(2)}`);
      }
      if (inputState.arrowDown) {
        newZ += deltaMovement; // Positive Z is backward on the court
        console.log(`Moving backward: newZ = ${newZ.toFixed(2)}`);
      }
      
      // Apply boundary checking to keep ball on court
      const bounds = gameState.courtBounds;
      newX = Math.max(bounds.minX, Math.min(bounds.maxX, newX));
      newZ = Math.max(bounds.minZ, Math.min(bounds.maxZ, newZ));
      
      // Set the new target position (using ground Y coordinate)
      basketballStateManager.setTargetPosition(newX, bounds.groundY, newZ);
      
      // Add rotation animation based on movement direction
      updateBasketballRotation(inputState);
    }
    
    // Enhanced power adjustment with rate limiting
    processEnhancedPowerInput();
  }
  
  // One-time actions (process once per key press)
  if (inputState.spacebar) {
    console.log('Processing shoot action');
    inputState.spacebar = false; // Reset to prevent continuous shooting
    // Shooting logic will be implemented in Phase 5
  }
  
  if (inputState.keyR) {
    console.log('Processing reset action');
    inputState.keyR = false; // Reset to prevent continuous resets
    resetBasketball();
  }
}

/**
 * Update basketball rotation based on movement direction
 * This creates realistic ball rolling animation
 * @param {Object} input - Current input state
 */
function updateBasketballRotation(input) {
  if (!basketballGroup) return;
  
  const ball = gameState.basketball;
  const rotationSpeed = 0.1; // Adjust this value to control rotation speed
  
  // Calculate rotation based on movement direction
  if (input.arrowLeft) {
    ball.rotation.z -= rotationSpeed * gameState.deltaTime * ball.movementSpeed;
  }
  if (input.arrowRight) {
    ball.rotation.z += rotationSpeed * gameState.deltaTime * ball.movementSpeed;
  }
  if (input.arrowUp) {
    ball.rotation.x += rotationSpeed * gameState.deltaTime * ball.movementSpeed;
  }
  if (input.arrowDown) {
    ball.rotation.x -= rotationSpeed * gameState.deltaTime * ball.movementSpeed;
  }
  
  // Apply rotation to the basketball visual
  basketballGroup.rotation.x = ball.rotation.x;
  basketballGroup.rotation.z = ball.rotation.z;
  
  // Maintain the original Y rotation for visual appeal
  basketballGroup.rotation.y = Math.PI / 6 + ball.rotation.y;
}

/**
 * Reset basketball to center court position
 */
function resetBasketball() {
  basketballStateManager.resetToCenter();
  updatePowerDisplay();
}

/**
 * Initialize input system
 */
function initializeInputSystem() {
  console.log('Initializing HW6 input system...');
  
  // Remove old keyboard event listener if it exists
  document.removeEventListener('keydown', handleKeyDown);
  
  // Add new comprehensive keyboard event listeners
  document.addEventListener('keydown', handleKeyDown);
  document.addEventListener('keyup', handleKeyUp);
  
  // Prevent arrow keys from scrolling the page
  window.addEventListener('keydown', function(event) {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(event.key)) {
      event.preventDefault();
    }
  });
  
  console.log('Input system initialized successfully');
  console.log('Available controls:');
  console.log('- Arrow Keys: Move basketball');
  console.log('- W/S: Adjust shot power');
  console.log('- Spacebar: Shoot basketball (when implemented)');
  console.log('- R: Reset basketball position');
  console.log('- O: Toggle orbit camera');
}

/**
 * Initialize enhanced basketball state management
 */
function initializeBasketballStateManagement() {
  console.log('Initializing enhanced basketball state management...');
  
  // Set initial state
  const ball = gameState.basketball;
  ball.position = { x: 0, y: gameState.courtBounds.groundY, z: 0 };
  ball.targetPosition = { x: 0, y: gameState.courtBounds.groundY, z: 0 };
  ball.previousPosition = { x: 0, y: gameState.courtBounds.groundY, z: 0 };
  
  // Ensure basketball visual is positioned correctly
  if (basketballGroup) {
    basketballGroup.position.set(0, gameState.courtBounds.groundY, 0);
  }
  
  console.log('Basketball state management initialized successfully');
  console.log('Features:');
  console.log('- Smooth position interpolation');
  console.log('- Realistic rotation based on movement');
  console.log('- Boundary enforcement');
  console.log('- Frame-rate independent movement');
}

// ============================================================================
// SCENE INITIALIZATION
// ============================================================================

// Initialize all scene elements
createBasketballCourt();
createBasketballHoop(-15); // Left hoop
createBasketballHoop(15);  // Right hoop
basketballGroup = createBasketball();  // Store reference for manipulation

// Position camera for optimal initial view of the court
const cameraTranslate = new THREE.Matrix4();
cameraTranslate.makeTranslation(0, 15, 30);
camera.applyMatrix4(cameraTranslate);

// Set up orbit controls for interactive camera movement
const controls = new OrbitControls(camera, renderer.domElement);
let isOrbitEnabled = true;

// ============================================================================
// MAIN ANIMATION LOOP
// ============================================================================

/**
 * Main animation loop
 */
function animate() {
  requestAnimationFrame(animate);

  // Process input every frame
  processInput();
  
  // Update basketball state with physics support
  if (physicsState.isPhysicsActive) {
    basketballPhysics.update(gameState.deltaTime);
    // Update visual position directly from physics
    if (basketballGroup) {
      basketballGroup.position.set(
        gameState.basketball.position.x,
        gameState.basketball.position.y,
        gameState.basketball.position.z
      );
    }
  } else {
    // Use smooth interpolation when physics is not active
    basketballStateManager.updateState(performance.now());
  }
  
  // Update orbit controls
  controls.enabled = isOrbitEnabled;
  controls.update();
  
  // Render the scene
  renderer.render(scene, camera);
}

// ============================================================================
// INITIALIZATION AND STARTUP
// ============================================================================

// Initialize HW6 input system
initializeInputSystem();

// Initialize enhanced basketball state management
initializeBasketballStateManagement();

// Initialize power system
initializePowerSystem();

// Initialize physics engine
initializePhysicsEngine();

// Start the animation loop
animate();