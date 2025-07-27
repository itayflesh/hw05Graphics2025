# Computer Graphics - Exercise 5 + 6 - WebGL Basketball Court

## Getting Started
1. Clone this repository to your local machine
2. Make sure you have Node.js installed
3. Start the local web server: `node index.js`
4. Open your browser and go to http://localhost:8000

## Group Members
**MANDATORY: Add the full names of all group members here:**
- Itay Flesh

## Controls
**Arrow Keys - Move Basketball:**
- Left/Right: Move ball horizontally across court
- Up/Down: Move ball forward/backward on court

**W / S Keys - Adjust Shot Power**
- W: Increase shot power (stronger shot)
- S: Decrease shot power (weaker shot)

**Spacebar - Shoot Basketball:**
- Launch ball toward nearest hoop
- Use current power level for initial velocity

**R Key - Reset Basketball:**
- Return ball to center court position
- Reset ball velocity to zero
- Reset shot power to default (50%)
- Clear any physics state

**O Key - Toggle Camera:**
- Enable/disable orbit camera controls

## Physics System Implementation

### **Gravity and Trajectory**
- **Constant Gravity**: Applied at -19.6 m/s² (scaled for game environment)
- **Parabolic Motion**: Ball follows realistic projectile physics with proper arc calculations
- **Initial Velocity**: Calculated based on shot power (0-100%) and distance to target hoop
- **Arc Height**: Dynamically adjusted based on shot distance and power

### **Collision Detection System**
Our physics engine implements comprehensive collision detection for multiple object types:

1. **Ground Collision**: 
   - Detects when ball hits court surface
   - Applies energy loss (70% bounce damping)
   - Includes ground friction for rolling motion

2. **Rim Collision**:
   - Precise torus-based collision detection for basketball rims
   - Handles both inner and outer rim collisions
   - 60% energy damping for realistic rim bounces

3. **Backboard Collision**:
   - Full backboard collision detection for both hoops
   - Proper reflection physics with 80% energy retention
   - Position-based collision resolution to prevent interpenetration

4. **Boundary Collision**:
   - Court boundary detection with automatic ball reset during shots
   - Prevents ball from leaving play area
   - Smart handling: bounces during ground movement, resets during shots

### **Advanced Physics Features**
- **Energy Conservation**: Realistic energy loss through various collision types
- **Rotation Physics**: Ball rotation matches movement direction and velocity
- **Air Resistance**: Subtle velocity damping for realistic flight
- **Settling Detection**: Ball automatically stops when velocity drops below threshold

## Scoring System
- **Points**: 2 points per successful shot
- **Bonus Points**: 
  - Swish shots (clean through hoop): +1 bonus
  - Long shots (>20 units): +3 bonus
  - Streak bonuses: +2 for 3 consecutive, +5 for 5+ consecutive
- **Statistics Tracking**: Live tracking of score, attempts, accuracy percentage
- **Visual Feedback**: Different messages for successful shots, misses, and special achievements

## Additional Features Implemented
- Realistic basketball court wood texture
- Detailed basketball backboard textures
- Enhanced collision system with backboard physics
- Comprehensive scoring system with streak bonuses
- Professional UI design with real-time statistics
- Advanced rotation animations during flight and ground movement
- Smart shot detection with swish vs. normal shot differentiation
- Automatic ball reset for out-of-bounds shots
- Power adjustment system with visual feedback

## Known Issues or Limitations
- None currently identified

## Gameplay Video
[gameplay demonstration video\]](https://www.canva.com/design/DAGuSH3tOPg/Ra7FLqVgikSOBfFqZvVk9w/watch?utm_content=DAGuSH3tOPg&utm_campaign=designshare&utm_medium=link2&utm_source=uniquelinks&utlId=ha347ce5ca8)

## Sources of External Assets
- Basketball court wood texture
- Basketball backboard texture
- Basketball texture