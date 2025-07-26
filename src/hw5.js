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
// HW6 - ENHANCED GAME STATE WITH COMPREHENSIVE SCORING SYSTEM
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
  
  // Enhanced scoring system
  score: 0,
  shotAttempts: 0,
  shotsMade: 0,
  lastShotResult: null,
  consecutiveShots: 0,
  bestStreak: 0,
  
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
// COMPREHENSIVE SCORING SYSTEM
// ============================================================================

class ScoringSystem {
  constructor() {
    this.pointsPerShot = 2;
    this.bonusPoints = {
      swish: 1,      // Extra point for clean shots
      streak3: 2,    // Bonus for 3 consecutive shots
      streak5: 5,    // Bonus for 5 consecutive shots
      longShot: 3    // Bonus for shots from far away
    };
  }
  
  /**
   * Process a successful shot and update statistics
   * @param {Object} shotData - Information about the shot
   */
  processSuccessfulShot(shotData) {
    const { type, distance, hoop } = shotData;
    
    // Update basic statistics
    gameState.shotsMade++;
    gameState.consecutiveShots++;
    gameState.lastShotResult = 'made';
    
    // Calculate points for this shot
    let points = this.pointsPerShot;
    let bonusReason = '';
    
    // Swish bonus
    if (type === 'swish') {
      points += this.bonusPoints.swish;
      bonusReason = 'SWISH! +1 Bonus';
    }
    
    // Distance bonus for long shots
    if (distance > 20) {
      points += this.bonusPoints.longShot;
      bonusReason += (bonusReason ? ' | ' : '') + 'Long Shot! +3 Bonus';
    }
    
    // Streak bonuses
    if (gameState.consecutiveShots === 3) {
      points += this.bonusPoints.streak3;
      bonusReason += (bonusReason ? ' | ' : '') + '3 in a Row! +2 Bonus';
    } else if (gameState.consecutiveShots === 5) {
      points += this.bonusPoints.streak5;
      bonusReason += (bonusReason ? ' | ' : '') + '5 Streak! +5 Bonus';
    } else if (gameState.consecutiveShots > 5 && gameState.consecutiveShots % 5 === 0) {
      points += this.bonusPoints.streak5;
      bonusReason += (bonusReason ? ' | ' : '') + `${gameState.consecutiveShots} Streak! +5 Bonus`;
    }
    
    // Update score
    gameState.score += points;
    
    // Update best streak
    if (gameState.consecutiveShots > gameState.bestStreak) {
      gameState.bestStreak = gameState.consecutiveShots;
    }
    
    // Show success message
    this.showShotResult('success', {
      type,
      points,
      bonusReason,
      streak: gameState.consecutiveShots,
      hoop: hoop.id
    });
    
    console.log(`SHOT MADE! +${points} points (${bonusReason || 'Standard shot'})`);
    console.log(`Current streak: ${gameState.consecutiveShots}`);
    
    return points;
  }
  
  /**
   * Process a missed shot
   * @param {Object} shotData - Information about the missed shot
   */
  processMissedShot(shotData) {
    gameState.consecutiveShots = 0;
    gameState.lastShotResult = 'missed';
    
    this.showShotResult('miss', {
      distance: shotData.distance || 0
    });
    
    console.log('Shot missed - streak reset');
  }
  
  /**
   * Show visual feedback for shot results
   * @param {string} result - 'success' or 'miss'
   * @param {Object} data - Additional data about the shot
   */
  showShotResult(result, data) {
    const statusElement = document.getElementById('game-status');
    if (!statusElement) return;
    
    // Clear existing classes
    statusElement.className = '';
    statusElement.classList.add('show');
    
    if (result === 'success') {
      const { type, points, bonusReason, streak, hoop } = data;
      
      if (type === 'swish') {
        statusElement.classList.add('swish');
        statusElement.innerHTML = `🎯 SWISH! +${points} Points<br><small>${bonusReason}</small>`;
      } else {
        statusElement.classList.add('shot-made');
        statusElement.innerHTML = `🏀 SHOT MADE! +${points} Points<br><small>${bonusReason || `Through ${hoop} hoop`}</small>`;
      }
      
      // Add celebration animation to score display
      const scoreDisplay = document.getElementById('score-display');
      if (scoreDisplay) {
        scoreDisplay.classList.add('celebrate');
        setTimeout(() => scoreDisplay.classList.remove('celebrate'), 600);
      }
      
    } else {
      statusElement.classList.add('shot-missed');
      statusElement.innerHTML = `❌ MISSED SHOT<br><small>Keep trying!</small>`;
    }
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
      statusElement.classList.remove('show');
    }, 3000);
    
    // Update all UI displays
    this.updateUI();
  }
  
  /**
   * Update all scoring-related UI elements
   */
  updateUI() {
    // Update score
    const scoreElement = document.getElementById('current-score');
    if (scoreElement) {
      scoreElement.textContent = gameState.score;
    }
    
    // Update shots made
    const shotsMadeElement = document.getElementById('shots-made');
    if (shotsMadeElement) {
      shotsMadeElement.textContent = gameState.shotsMade;
    }
    
    // Update shot attempts
    const attemptsElement = document.getElementById('shot-attempts');
    if (attemptsElement) {
      attemptsElement.textContent = gameState.shotAttempts;
    }
    
    // Update and style shooting accuracy
    const accuracyElement = document.getElementById('shooting-accuracy');
    if (accuracyElement) {
      const accuracy = gameState.shotAttempts > 0 ? 
        Math.round((gameState.shotsMade / gameState.shotAttempts) * 100) : 0;
      
      accuracyElement.textContent = `${accuracy}%`;
      
      // Update accuracy styling based on percentage
      accuracyElement.className = 'stat-value accuracy-value';
      if (accuracy >= 70) {
        accuracyElement.classList.add('high');
      } else if (accuracy >= 40) {
        accuracyElement.classList.add('medium');
      } else {
        accuracyElement.classList.add('low');
      }
    }
    
    console.log(`UI Updated - Score: ${gameState.score}, Made: ${gameState.shotsMade}/${gameState.shotAttempts}`);
  }
  
  /**
   * Get current shooting statistics
   * @returns {Object} Current statistics
   */
  getStatistics() {
    const accuracy = gameState.shotAttempts > 0 ? 
      (gameState.shotsMade / gameState.shotAttempts) * 100 : 0;
    
    return {
      score: gameState.score,
      shotAttempts: gameState.shotAttempts,
      shotsMade: gameState.shotsMade,
      accuracy: Math.round(accuracy * 10) / 10, // Round to 1 decimal
      currentStreak: gameState.consecutiveShots,
      bestStreak: gameState.bestStreak,
      lastResult: gameState.lastShotResult
    };
  }
  
  /**
   * Reset all statistics
   */
  resetStatistics() {
    gameState.score = 0;
    gameState.shotAttempts = 0;
    gameState.shotsMade = 0;
    gameState.consecutiveShots = 0;
    gameState.bestStreak = 0;
    gameState.lastShotResult = null;
    
    this.updateUI();
    
    // Clear status message
    const statusElement = document.getElementById('game-status');
    if (statusElement) {
      statusElement.classList.remove('show');
    }
    
    console.log('All statistics reset');
  }
}

// Create global scoring system instance
const scoringSystem = new ScoringSystem();

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
    updatePowerDisplay();
  }
}

const basketballStateManager = new BasketballStateManager();

// ============================================================================
// SHOT POWER SYSTEM FUNCTIONS
// ============================================================================

function adjustShotPower(delta) {
  const oldPower = gameState.shotPower;
  gameState.shotPower = Math.max(gameState.minPower, 
                                Math.min(gameState.maxPower, 
                                        gameState.shotPower + delta));
  
  if (gameState.shotPower !== oldPower) {
    console.log(`Shot power adjusted: ${oldPower} -> ${gameState.shotPower}%`);
    updatePowerDisplay();
    showPowerChangeMessage(gameState.shotPower > oldPower ? 'increase' : 'decrease');
  }
}

function updatePowerDisplay() {
  const powerElement = document.getElementById('power-indicator');
  if (powerElement) {
    powerElement.textContent = `${gameState.shotPower}%`;
    
    powerElement.className = 'power-value';
    if (gameState.shotPower < 25) {
      powerElement.classList.add('power-low');
    } else if (gameState.shotPower > 75) {
      powerElement.classList.add('power-high');
    } else {
      powerElement.classList.add('power-medium');
    }
  }
  
  const powerBar = document.getElementById('power-bar-fill');
  if (powerBar) {
    const percentage = (gameState.shotPower / gameState.maxPower) * 100;
    powerBar.style.width = `${percentage}%`;
    
    if (gameState.shotPower < 25) {
      powerBar.style.backgroundColor = '#ff4444';
    } else if (gameState.shotPower > 75) {
      powerBar.style.backgroundColor = '#44ff44';
    } else {
      powerBar.style.backgroundColor = '#ffaa00';
    }
  }
}

function showPowerChangeMessage(direction) {
  const messageElement = document.getElementById('power-change-message');
  if (messageElement) {
    messageElement.textContent = direction === 'increase' ? 'Power ↑' : 'Power ↓';
    messageElement.className = `power-change-message ${direction}`;
    messageElement.style.opacity = '1';
    
    setTimeout(() => {
      messageElement.style.opacity = '0';
    }, 500);
  }
}

function processEnhancedPowerInput() {
  const powerAdjustmentRate = 60;
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

// ============================================================================
// PHYSICS ENGINE IMPLEMENTATION
// ============================================================================

const PHYSICS_CONFIG = {
  gravity: -9.8,
  scaledGravity: -19.6,
  groundFriction: 0.8,
  airResistance: 0.99,
  bounceDamping: 0.7,
  minBounceVelocity: 1.0,
  restingThreshold: 0.1,
  rimRadius: 0.23,
  rimTolerance: 0.05,
  scoreHeight: 4.3
};

const physicsState = {
  isPhysicsActive: false,
  groundLevel: 0.25,
  timeScale: 1.0,
  lastCollisionTime: 0,
  debugMode: false
};

// Enhanced CollisionDetector class with proper backboard collision detection
class CollisionDetector {
  constructor() {
    this.ballRadius = gameState.basketball.radius;
    this.courtBounds = gameState.courtBounds;
    
    // Rim collision configuration
    this.rims = [
      { 
        id: 'left', 
        position: { x: -13.7, y: 4.5, z: 0 }, 
        radius: 0.23,
        thickness: 0.02 
      },
      { 
        id: 'right', 
        position: { x: 13.7, y: 4.5, z: 0 }, 
        radius: 0.23,
        thickness: 0.02 
      }
    ];
    
    // NEW: Backboard collision configuration
    this.backboards = [
      {
        id: 'left',
        position: { x: -14, y: 5, z: 0 }, // Position in front of support structure
        width: 2.8,  // Backboard width
        height: 1.6, // Backboard height
        thickness: 0.1, // Backboard thickness
        normal: { x: 1, y: 0, z: 0 } // Points toward center court
      },
      {
        id: 'right',
        position: { x: 14, y: 5, z: 0 }, // Position in front of support structure
        width: 2.8,
        height: 1.6,
        thickness: 0.1,
        normal: { x: -1, y: 0, z: 0 } // Points toward center court
      }
    ];
  }
  
  checkGroundCollision(position, velocity) {
    const collision = {
      isColliding: false,
      normal: { x: 0, y: 1, z: 0 },
      penetration: 0
    };
    
    if (position.y <= physicsState.groundLevel) {
      collision.isColliding = true;
      collision.penetration = physicsState.groundLevel - position.y;
    }
    
    return collision;
  }
  
  checkBoundaryCollision(position, velocity) {
    const collision = {
      isColliding: false,
      normal: { x: 0, y: 0, z: 0 },
      penetration: 0
    };
    
    const bounds = this.courtBounds;
    const radius = this.ballRadius;
    
    if (position.x - radius <= bounds.minX) {
      collision.isColliding = true;
      collision.normal = { x: 1, y: 0, z: 0 };
      collision.penetration = bounds.minX - (position.x - radius);
    } else if (position.x + radius >= bounds.maxX) {
      collision.isColliding = true;
      collision.normal = { x: -1, y: 0, z: 0 };
      collision.penetration = (position.x + radius) - bounds.maxX;
    }
    
    if (position.z - radius <= bounds.minZ) {
      collision.isColliding = true;
      collision.normal = { x: 0, y: 0, z: 1 };
      collision.penetration = bounds.minZ - (position.z - radius);
    } else if (position.z + radius >= bounds.maxZ) {
      collision.isColliding = true;
      collision.normal = { x: 0, y: 0, z: -1 };
      collision.penetration = (position.z + radius) - bounds.maxZ;
    }
    
    return collision;
  }
  
  // NEW: Check collision with basketball backboards
  checkBackboardCollision(position, velocity) {
    const collisions = [];
    
    for (const backboard of this.backboards) {
      const collision = this.checkSingleBackboardCollision(position, velocity, backboard);
      if (collision.isColliding) {
        collisions.push({ type: 'backboard', backboard: backboard.id, ...collision });
      }
    }
    
    return collisions;
  }
  
  checkSingleBackboardCollision(ballPosition, ballVelocity, backboard) {
    const collision = {
      isColliding: false,
      normal: { x: 0, y: 0, z: 0 },
      penetration: 0,
      point: { x: 0, y: 0, z: 0 }
    };
    
    const bbPos = backboard.position;
    const bbWidth = backboard.width;
    const bbHeight = backboard.height;
    const bbThickness = backboard.thickness;
    const ballRadius = this.ballRadius;
    
    // Check if ball is in the correct range for this backboard
    const verticalRange = Math.abs(ballPosition.y - bbPos.y) <= (bbHeight / 2 + ballRadius);
    const horizontalRange = Math.abs(ballPosition.z - bbPos.z) <= (bbWidth / 2 + ballRadius);
    
    if (!verticalRange || !horizontalRange) {
      return collision; // Ball is not in range of this backboard
    }
    
    // Calculate distance from ball to backboard surface
    let distanceToSurface;
    let surfacePoint = { x: bbPos.x, y: bbPos.y, z: bbPos.z };
    
    if (backboard.id === 'left') {
      // Left backboard - check collision from the right side (center court side)
      distanceToSurface = (bbPos.x + bbThickness / 2) - ballPosition.x;
      surfacePoint.x = bbPos.x + bbThickness / 2;
    } else {
      // Right backboard - check collision from the left side (center court side)  
      distanceToSurface = ballPosition.x - (bbPos.x - bbThickness / 2);
      surfacePoint.x = bbPos.x - bbThickness / 2;
    }
    
    // Check if ball is penetrating the backboard
    if (distanceToSurface <= ballRadius && distanceToSurface > -bbThickness) {
      // Ensure ball is within the backboard boundaries
      const withinVerticalBounds = ballPosition.y >= (bbPos.y - bbHeight / 2) && 
                                   ballPosition.y <= (bbPos.y + bbHeight / 2);
      const withinHorizontalBounds = ballPosition.z >= (bbPos.z - bbWidth / 2) && 
                                     ballPosition.z <= (bbPos.z + bbWidth / 2);
      
      if (withinVerticalBounds && withinHorizontalBounds) {
        collision.isColliding = true;
        collision.normal = { ...backboard.normal };
        collision.penetration = ballRadius - distanceToSurface;
        collision.point = { ...surfacePoint };
        
        // Clamp the collision point to the backboard surface
        collision.point.y = Math.max(bbPos.y - bbHeight / 2, 
                                    Math.min(bbPos.y + bbHeight / 2, ballPosition.y));
        collision.point.z = Math.max(bbPos.z - bbWidth / 2, 
                                    Math.min(bbPos.z + bbWidth / 2, ballPosition.z));
        
        console.log(`Backboard collision detected with ${backboard.id} backboard!`);
        console.log(`Penetration: ${collision.penetration.toFixed(3)}, Distance: ${distanceToSurface.toFixed(3)}`);
      }
    }
    
    return collision;
  }
  
  // Check collision with basketball rims (existing code - keeping for completeness)
  checkRimCollision(position, velocity) {
    const collisions = [];
    
    for (const rim of this.rims) {
      const collision = this.checkSingleRimCollision(position, velocity, rim);
      if (collision.isColliding) {
        collisions.push({ type: 'rim', rim: rim.id, ...collision });
      }
    }
    
    return collisions;
  }
  
  checkSingleRimCollision(ballPosition, ballVelocity, rim) {
    const collision = {
      isColliding: false,
      normal: { x: 0, y: 0, z: 0 },
      penetration: 0,
      point: { x: 0, y: 0, z: 0 }
    };
    
    const rimPos = rim.position;
    const rimRadius = rim.radius;
    const rimThickness = rim.thickness;
    const ballRadius = this.ballRadius;
    
    // Calculate distance from ball center to rim center (2D in XZ plane)
    const dx = ballPosition.x - rimPos.x;
    const dz = ballPosition.z - rimPos.z;
    const horizontalDistance = Math.sqrt(dx * dx + dz * dz);
    
    // Check if ball is in the right height range for rim collision
    const heightDiff = Math.abs(ballPosition.y - rimPos.y);
    const maxHeightForCollision = ballRadius + rimThickness;
    
    if (heightDiff > maxHeightForCollision) {
      return collision; // Too far above or below rim
    }
    
    // Check for collision with the rim torus
    // Distance from ball center to the rim torus center line
    const distanceToRimCenter = Math.abs(horizontalDistance - rimRadius);
    const totalCollisionDistance = ballRadius + rimThickness;
    
    if (distanceToRimCenter <= totalCollisionDistance && heightDiff <= rimThickness + ballRadius) {
      collision.isColliding = true;
      
      // Calculate collision normal
      if (horizontalDistance < rimRadius) {
        // Ball is inside the rim - push outward
        if (horizontalDistance > 0.001) {
          collision.normal.x = -dx / horizontalDistance;
          collision.normal.z = -dz / horizontalDistance;
        } else {
          // Ball is exactly at center, push in arbitrary direction
          collision.normal.x = 1;
          collision.normal.z = 0;
        }
        collision.penetration = ballRadius - (rimRadius - horizontalDistance);
      } else {
        // Ball is outside the rim - collision with outer edge
        collision.normal.x = dx / horizontalDistance;
        collision.normal.z = dz / horizontalDistance;
        collision.penetration = ballRadius + rimThickness - (horizontalDistance - rimRadius);
      }
      
      // Add vertical component if ball hits top or bottom of rim
      if (ballPosition.y > rimPos.y + rimThickness / 2) {
        collision.normal.y = 0.3; // Slight upward bounce
      } else if (ballPosition.y < rimPos.y - rimThickness / 2) {
        collision.normal.y = -0.3; // Slight downward push
      }
      
      // Normalize the collision normal
      const normalLength = Math.sqrt(
        collision.normal.x * collision.normal.x +
        collision.normal.y * collision.normal.y +
        collision.normal.z * collision.normal.z
      );
      
      if (normalLength > 0.001) {
        collision.normal.x /= normalLength;
        collision.normal.y /= normalLength;
        collision.normal.z /= normalLength;
      }
      
      console.log(`Rim collision detected with ${rim.id} rim!`);
    }
    
    return collision;
  }
  
  checkAllCollisions(position, velocity) {
    const collisions = [];
    
    // Check ground collision
    const groundCollision = this.checkGroundCollision(position, velocity);
    if (groundCollision.isColliding) {
      collisions.push({ type: 'ground', ...groundCollision });
    }
    
    // Check boundary collision
    const boundaryCollision = this.checkBoundaryCollision(position, velocity);
    if (boundaryCollision.isColliding) {
      collisions.push({ type: 'boundary', ...boundaryCollision });
    }
    
    // NEW: Check backboard collisions
    const backboardCollisions = this.checkBackboardCollision(position, velocity);
    collisions.push(...backboardCollisions);
    
    // Check rim collisions
    const rimCollisions = this.checkRimCollision(position, velocity);
    collisions.push(...rimCollisions);
    
    return collisions;
  }
}

class HoopDetector {
  constructor() {
    this.hoops = [
      { id: 'left', position: { x: -13.7, y: 4.5, z: 0 } },
      { id: 'right', position: { x: 13.7, y: 4.5, z: 0 } }
    ];
  }
  
  findNearestHoop(ballPosition) {
    let nearestHoop = null;
    let minDistance = Infinity;
    
    for (const hoop of this.hoops) {
      const dx = hoop.position.x - ballPosition.x;
      const dz = hoop.position.z - ballPosition.z;
      const distance = Math.sqrt(dx * dx + dz * dz);
      
      if (distance < minDistance) {
        minDistance = distance;
        nearestHoop = { ...hoop, distance };
      }
    }
    
    return nearestHoop;
  }
  
  calculateShotToHoop(ballPosition, targetHoop, power) {
    const target = targetHoop.position;
    
    const dx = target.x - ballPosition.x;
    const dy = target.y - ballPosition.y;
    const dz = target.z - ballPosition.z;
    const horizontalDistance = Math.sqrt(dx * dx + dz * dz);
    
    const powerMultiplier = 0.4 + (power / 100) * 0.6;
    const baseVelocity = 25;
    const totalVelocity = baseVelocity * powerMultiplier;
    
    const gravity = Math.abs(PHYSICS_CONFIG.scaledGravity);
    const arcHeight = 2.0;
    const targetHeight = dy + arcHeight;
    
    let launchAngle;
    if (horizontalDistance < 4.0) {
      launchAngle = Math.PI / 3 + (Math.PI / 12);
    } else {
      launchAngle = Math.PI / 4 + (horizontalDistance / 30) * (Math.PI / 6);
    }
    
    const horizontalVel = totalVelocity * Math.cos(launchAngle);
    const verticalVel = totalVelocity * Math.sin(launchAngle);
    
    const direction = {
      x: dx / horizontalDistance,
      z: dz / horizontalDistance
    };
    
    const velocity = {
      x: direction.x * horizontalVel,
      y: verticalVel,
      z: direction.z * horizontalVel
    };
    
    return velocity;
  }
  
  checkScore(ballPosition, ballPrevPosition, ballVelocity) {
    const scoreResult = {
      scored: false,
      hoop: null,
      type: 'miss',
      distance: 0
    };
    
    // Only check for scoring if ball is moving downward
    if (ballVelocity.y >= 0) return scoreResult;
    
    for (const hoop of this.hoops) {
      const rimPos = hoop.position;
      
      // Distance from rim center (2D)
      const distanceToRim = Math.sqrt(
        Math.pow(ballPosition.x - rimPos.x, 2) + 
        Math.pow(ballPosition.z - rimPos.z, 2)
      );
      
      // Check if ball is within scoring area (smaller than collision area)
      const scoreRadius = PHYSICS_CONFIG.rimRadius * 0.8; // Smaller radius for scoring
      
      if (distanceToRim <= scoreRadius) {
        const crossedRimHeight = ballPrevPosition.y > rimPos.y && ballPosition.y <= rimPos.y;
        const validHeight = ballPosition.y >= PHYSICS_CONFIG.scoreHeight;
        
        if (crossedRimHeight && validHeight) {
          scoreResult.scored = true;
          scoreResult.hoop = hoop;
          scoreResult.type = distanceToRim <= scoreRadius * 0.7 ? 'swish' : 'score';
          scoreResult.distance = Math.sqrt(
            Math.pow(rimPos.x - gameState.basketball.previousPosition.x, 2) +
            Math.pow(rimPos.z - gameState.basketball.previousPosition.z, 2)
          );
          
          console.log(`SCORE! Ball went through ${hoop.id} rim - Type: ${scoreResult.type}`);
          break;
        }
      }
    }
    
    return scoreResult;
  }
}

// Enhanced BasketballPhysicsEngine with proper backboard collision handling
class BasketballPhysicsEngine {
  constructor() {
    this.collisionDetector = new CollisionDetector();
    this.isActive = false;
  }
  
  startPhysics(initialVelocity) {
    console.log('Starting physics simulation with velocity:', initialVelocity);
    
    const ball = gameState.basketball;
    
    ball.velocity = { ...initialVelocity };
    ball.isInFlight = true;
    ball.isOnGround = false;
    physicsState.isPhysicsActive = true;
    this.isActive = true;
    
    console.log('Physics simulation started');
  }
  
  stopPhysics() {
    const ball = gameState.basketball;
    
    ball.velocity = { x: 0, y: 0, z: 0 };
    ball.isInFlight = false;
    ball.isOnGround = true;
    physicsState.isPhysicsActive = false;
    this.isActive = false;
    
    console.log('Physics simulation stopped');
  }
  
  applyGravity(deltaTime) {
    if (!physicsState.isPhysicsActive) return;
    
    const ball = gameState.basketball;
    
    ball.velocity.y += PHYSICS_CONFIG.scaledGravity * deltaTime;
    
    const resistance = Math.pow(PHYSICS_CONFIG.airResistance, deltaTime * 60);
    ball.velocity.x *= resistance;
    ball.velocity.z *= resistance;
    ball.velocity.y *= Math.pow(0.995, deltaTime * 60);
  }
  
  updatePosition(deltaTime) {
    if (!physicsState.isPhysicsActive) return;
    
    const ball = gameState.basketball;
    
    ball.previousPosition = { ...ball.position };
    
    ball.position.x += ball.velocity.x * deltaTime;
    ball.position.y += ball.velocity.y * deltaTime;
    ball.position.z += ball.velocity.z * deltaTime;
    
    ball.targetPosition = { ...ball.position };
  }
  
  handleCollisions(collisions) {
    if (collisions.length === 0) return;
    
    const ball = gameState.basketball;
    const currentTime = performance.now();
    
    if (currentTime - physicsState.lastCollisionTime < 50) return;
    
    for (const collision of collisions) {
      this.resolveCollision(collision);
    }
    
    physicsState.lastCollisionTime = currentTime;
  }
  
  resolveCollision(collision) {
    const ball = gameState.basketball;
    const { normal, penetration, type } = collision;
    
    console.log(`Resolving collision: ${type}, penetration: ${penetration?.toFixed(3)}`);
    
    // Position correction to prevent object interpenetration
    if (penetration > 0) {
      ball.position.x += normal.x * penetration;
      ball.position.y += normal.y * penetration;
      ball.position.z += normal.z * penetration;
      console.log(`Position corrected by: (${(normal.x * penetration).toFixed(3)}, ${(normal.y * penetration).toFixed(3)}, ${(normal.z * penetration).toFixed(3)})`);
    }
    
    // Calculate velocity component along collision normal
    const dotProduct = ball.velocity.x * normal.x + 
                      ball.velocity.y * normal.y + 
                      ball.velocity.z * normal.z;
    
    console.log(`Velocity dot product with normal: ${dotProduct.toFixed(3)}`);
    
    // Only resolve if objects are moving toward each other
    if (dotProduct < 0) {
      // Store original velocity for debugging
      const originalVelocity = { ...ball.velocity };
      
      // Reflect velocity along the normal
      ball.velocity.x -= 2 * dotProduct * normal.x;
      ball.velocity.y -= 2 * dotProduct * normal.y;
      ball.velocity.z -= 2 * dotProduct * normal.z;
      
      // Apply different damping based on collision type
      let damping = PHYSICS_CONFIG.bounceDamping;
      
      if (type === 'ground') {
        damping = PHYSICS_CONFIG.bounceDamping * 0.8;
        
        // Handle ground settling
        if (Math.abs(ball.velocity.y) < PHYSICS_CONFIG.minBounceVelocity) {
          ball.velocity.y = 0;
          ball.position.y = physicsState.groundLevel;
          ball.isOnGround = true;
          
          ball.velocity.x *= PHYSICS_CONFIG.groundFriction;
          ball.velocity.z *= PHYSICS_CONFIG.groundFriction;
          
          console.log('Ball settled on ground');
          
          const horizontalSpeed = Math.sqrt(ball.velocity.x ** 2 + ball.velocity.z ** 2);
          if (horizontalSpeed < PHYSICS_CONFIG.restingThreshold) {
            this.stopPhysics();
            return;
          }
        }
      } 
      else if (type === 'backboard') {
        // NEW: Special handling for backboard collisions
        damping = 0.8; // Moderate energy loss when hitting backboard
        
        // Ensure proper reflection off backboard
        console.log(`Backboard collision with ${collision.backboard} backboard`);
        console.log(`Normal: (${normal.x.toFixed(3)}, ${normal.y.toFixed(3)}, ${normal.z.toFixed(3)})`);
        console.log(`Original velocity: (${originalVelocity.x.toFixed(3)}, ${originalVelocity.y.toFixed(3)}, ${originalVelocity.z.toFixed(3)})`);
        console.log(`Reflected velocity: (${ball.velocity.x.toFixed(3)}, ${ball.velocity.y.toFixed(3)}, ${ball.velocity.z.toFixed(3)})`);
        
        // Add slight randomization to make backboard bounces more realistic
        const randomFactor = 0.05;
        ball.velocity.y += (Math.random() - 0.5) * randomFactor;
        ball.velocity.z += (Math.random() - 0.5) * randomFactor;
        
        // Ensure ball bounces away from backboard (additional safety check)
        if (collision.backboard === 'left' && ball.velocity.x < 0) {
          ball.velocity.x = Math.abs(ball.velocity.x);
          console.log('Corrected velocity direction for left backboard');
        } else if (collision.backboard === 'right' && ball.velocity.x > 0) {
          ball.velocity.x = -Math.abs(ball.velocity.x);
          console.log('Corrected velocity direction for right backboard');
        }
      }
      else if (type === 'rim') {
        // Special handling for rim collisions
        damping = 0.6; // More energy loss when hitting the rim
        
        // Add some randomization to rim bounces for realism
        const randomFactor = 0.1;
        ball.velocity.x += (Math.random() - 0.5) * randomFactor;
        ball.velocity.z += (Math.random() - 0.5) * randomFactor;
        
        console.log(`Ball bounced off ${collision.rim} rim with damping ${damping}`);
      }
      else if (type === 'boundary') {
        damping = 0.7; // Court boundary bounces
      }
      
      // Apply damping to all velocity components
      ball.velocity.x *= damping;
      ball.velocity.y *= damping;
      ball.velocity.z *= damping;
      
      console.log(`Final velocity after damping (${damping}): (${ball.velocity.x.toFixed(3)}, ${ball.velocity.y.toFixed(3)}, ${ball.velocity.z.toFixed(3)})`);
    } else {
      console.log('No collision resolution needed - objects moving away from each other');
    }
  }
  
  updateRotationFromVelocity(deltaTime) {
    if (!physicsState.isPhysicsActive) return;
    
    const ball = gameState.basketball;
    const rotationFactor = 0.05;
    
    ball.rotationVelocity.x = -ball.velocity.z * rotationFactor;
    ball.rotationVelocity.z = ball.velocity.x * rotationFactor;
    
    ball.rotation.x += ball.rotationVelocity.x * deltaTime;
    ball.rotation.z += ball.rotationVelocity.z * deltaTime;
    
    if (basketballGroup) {
      basketballGroup.rotation.x = ball.rotation.x;
      basketballGroup.rotation.z = ball.rotation.z;
      basketballGroup.rotation.y = Math.PI / 6 + ball.rotation.y;
    }
  }
  
  // NEW: Debug method to test backboard collision
  testBackboardCollision() {
    console.log('Testing backboard collision...');
    
    // Position ball near left backboard
    gameState.basketball.position = { x: -13.5, y: 5, z: 0 };
    gameState.basketball.targetPosition = { ...gameState.basketball.position };
    
    // Give it velocity toward the backboard
    const testVelocity = { x: -5, y: 0, z: 0 };
    this.startPhysics(testVelocity);
    
    console.log('Backboard collision test started');
  }
  
  update(deltaTime) {
    if (!this.isActive) return;
    
    const ball = gameState.basketball;
    const prevPosition = { ...ball.position };
    
    this.applyGravity(deltaTime);
    this.updatePosition(deltaTime);
    
    // Check for scoring
    const scoreResult = hoopDetector.checkScore(ball.position, prevPosition, ball.velocity);
    if (scoreResult.scored) {
      console.log(`BASKETBALL SCORE! Through ${scoreResult.hoop.id} hoop!`);
      scoringSystem.processSuccessfulShot({
        type: scoreResult.type,
        distance: scoreResult.distance,
        hoop: scoreResult.hoop
      });
    }
    
    const collisions = this.collisionDetector.checkAllCollisions(ball.position, ball.velocity);
    if (collisions.length > 0) {
      console.log(`Found ${collisions.length} collision(s):`, collisions.map(c => c.type));
    }
    this.handleCollisions(collisions);
    this.updateRotationFromVelocity(deltaTime);
  }
}

const basketballPhysics = new BasketballPhysicsEngine();
const hoopDetector = new HoopDetector();

// ============================================================================
// INPUT HANDLING FUNCTIONS
// ============================================================================

function handleKeyDown(event) {
  const gameKeys = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'KeyW', 'KeyS', ' ', 'KeyR', 'KeyO'];
  if (gameKeys.includes(event.code) || gameKeys.includes(event.key)) {
    event.preventDefault();
  }
  
  switch (event.code) {
    case 'ArrowLeft':
      inputState.arrowLeft = true;
      break;
    case 'ArrowRight':
      inputState.arrowRight = true;
      break;
    case 'ArrowUp':
      inputState.arrowUp = true;
      break;
    case 'ArrowDown':
      inputState.arrowDown = true;
      break;
    case 'KeyW':
      inputState.keyW = true;
      break;
    case 'KeyS':
      inputState.keyS = true;
      break;
    case 'Space':
      inputState.spacebar = true;
      break;
    case 'KeyR':
      inputState.keyR = true;
      break;
    case 'KeyO':
      inputState.keyO = true;
      isOrbitEnabled = !isOrbitEnabled;
      console.log('O pressed - Toggle orbit camera:', isOrbitEnabled);
      break;
    // Debug controls
    case 'KeyG':
      physicsState.debugMode = !physicsState.debugMode;
      console.log('G pressed - Physics debug mode:', physicsState.debugMode);
      break;
    case 'KeyP':
      console.log('P pressed - Testing physics drop');
      basketballPhysics.testDrop?.();
      break;
  }
}

function handleKeyUp(event) {
  switch (event.code) {
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
    case 'KeyW':
      inputState.keyW = false;
      break;
    case 'KeyS':
      inputState.keyS = false;
      break;
    case 'Space':
      inputState.spacebar = false;
      break;
    case 'KeyR':
      inputState.keyR = false;
      break;
    case 'KeyO':
      inputState.keyO = false;
      break;
  }
}

function processInput() {
  if (!gameState.basketball.isInFlight) {
    if (inputState.arrowLeft || inputState.arrowRight || 
        inputState.arrowUp || inputState.arrowDown) {
      
      const movementSpeed = gameState.basketball.movementSpeed;
      const deltaMovement = movementSpeed * gameState.deltaTime;
      
      let newX = gameState.basketball.targetPosition ? 
                 gameState.basketball.targetPosition.x : 
                 gameState.basketball.position.x;
      let newZ = gameState.basketball.targetPosition ? 
                 gameState.basketball.targetPosition.z : 
                 gameState.basketball.position.z;
      
      if (inputState.arrowLeft) newX -= deltaMovement;
      if (inputState.arrowRight) newX += deltaMovement;
      if (inputState.arrowUp) newZ -= deltaMovement;
      if (inputState.arrowDown) newZ += deltaMovement;
      
      const bounds = gameState.courtBounds;
      newX = Math.max(bounds.minX, Math.min(bounds.maxX, newX));
      newZ = Math.max(bounds.minZ, Math.min(bounds.maxZ, newZ));
      
      basketballStateManager.setTargetPosition(newX, bounds.groundY, newZ);
      updateBasketballRotation(inputState);
    }
    
    processEnhancedPowerInput();
  }
  
  if (inputState.spacebar) {
    console.log('Processing shoot action');
    inputState.spacebar = false;
    
    if (!gameState.basketball.isInFlight) {
      // Increment shot attempts first
      gameState.shotAttempts++;
      
      const nearestHoop = hoopDetector.findNearestHoop(gameState.basketball.position);
      const shotVelocity = hoopDetector.calculateShotToHoop(
        gameState.basketball.position, 
        nearestHoop, 
        gameState.shotPower
      );
      
      basketballPhysics.startPhysics(shotVelocity);
      
      // Start checking for missed shots after a delay
      setTimeout(() => {
        if (!gameState.basketball.isInFlight && gameState.lastShotResult !== 'made') {
          // Shot missed - ball has settled without scoring
          scoringSystem.processMissedShot({
            distance: nearestHoop.distance
          });
        }
      }, 5000); // Check after 5 seconds
      
      scoringSystem.updateUI();
    }
  }
  
  if (inputState.keyR) {
    console.log('Processing reset action');
    inputState.keyR = false;
    resetBasketball();
  }
}

function updateBasketballRotation(input) {
  if (!basketballGroup) return;
  
  const ball = gameState.basketball;
  const rotationSpeed = 0.1;
  
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
  
  basketballGroup.rotation.x = ball.rotation.x;
  basketballGroup.rotation.z = ball.rotation.z;
  basketballGroup.rotation.y = Math.PI / 6 + ball.rotation.y;
}

function resetBasketball() {
  basketballStateManager.resetToCenter();
  updatePowerDisplay();
}

// ============================================================================
// INITIALIZATION FUNCTIONS
// ============================================================================

function initializeInputSystem() {
  console.log('Initializing HW6 input system...');
  
  document.removeEventListener('keydown', handleKeyDown);
  document.addEventListener('keydown', handleKeyDown);
  document.addEventListener('keyup', handleKeyUp);
  
  window.addEventListener('keydown', function(event) {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(event.key)) {
      event.preventDefault();
    }
  });
  
  console.log('Input system initialized successfully');
}

function initializeUI() {
  console.log('Initializing HW6 UI system...');
  
  // Initialize power display
  updatePowerDisplay();
  
  // Initialize scoring display
  scoringSystem.updateUI();
  
  console.log('UI system initialized successfully');
}

// ============================================================================
// SCENE INITIALIZATION
// ============================================================================

createBasketballCourt();
createBasketballHoop(-15);
createBasketballHoop(15);
basketballGroup = createBasketball();

const cameraTranslate = new THREE.Matrix4();
cameraTranslate.makeTranslation(0, 15, 30);
camera.applyMatrix4(cameraTranslate);

const controls = new OrbitControls(camera, renderer.domElement);
let isOrbitEnabled = true;

// ============================================================================
// MAIN ANIMATION LOOP
// ============================================================================

function animate() {
  requestAnimationFrame(animate);

  processInput();
  
  if (physicsState.isPhysicsActive) {
    basketballPhysics.update(gameState.deltaTime);
    if (basketballGroup) {
      basketballGroup.position.set(
        gameState.basketball.position.x,
        gameState.basketball.position.y,
        gameState.basketball.position.z
      );
    }
  } else {
    basketballStateManager.updateState(performance.now());
  }
  
  controls.enabled = isOrbitEnabled;
  controls.update();
  
  renderer.render(scene, camera);
}

// ============================================================================
// INITIALIZATION AND STARTUP
// ============================================================================

// Handle window resize
window.addEventListener('resize', function() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Initialize all systems
initializeInputSystem();
initializeUI();

// Start the animation loop
animate();

// console.log('HW6 Basketball Shooting Game fully initialized!');
// console.log('Features implemented:');
// console.log('✅ Interactive basketball movement (Arrow keys)');
// console.log('✅ Shot power system (W/S keys)');
// console.log('✅ Physics-based shooting (Spacebar)');
// console.log('✅ Comprehensive scoring system');
// console.log('✅ Real-time statistics tracking');
// console.log('✅ Visual feedback for shots');
// console.log('✅ Basketball rotation animations');
// console.log('✅ Reset functionality (R key)');
// console.log('✅ Camera controls (O key)');
// console.log('Game ready to play!');