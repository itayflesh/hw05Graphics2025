# Computer Graphics - Exercise 5 + 6 - WebGL Basketball Court

## Getting Started
1. Clone this repository to your local machine
2. Make sure you have Node.js installed
3. Start the local web server: `node index.js`
4. Open your browser and go to http://localhost:8000

## Complete Instructions
**All detailed instructions, requirements, and specifications can be found in:**
`basketball_exercise_instructions.html`

## Group Members
**MANDATORY: Add the full names of all group members here:**
- Itay Flesh

## Controls
**Arrow Keys - Move Basketball :**
- Left/Right: Move ball horizontally across court
- Up/Down: Move ball forward/backward on court

**W / S Keys - Adjust Shot Power**
- W: Increase shot power (stronger shot)
- S: Decrease shot power (weaker shot)
- Visual indicator showing current power level
- Power range: 0% to 100%

**Spacebar - Shoot Basketball:**
- Launch ball toward nearest hoop
- Use current power level for initial velocity
- Calculate trajectory to reach hoop
- Apply physics simulation after launch

**R Key - Reset Basketball:**
- Return ball to center court position
- Reset ball velocity to zero
- Reset shot power to default (50%)
- Clear any physics state

**O Key - Toggle Camera:**
- Enable/disable orbit camera controls
- (Inherited from HW05)

## Additional Features Implemented
- Realistic basketball court wood texture
- Detailed basketball backboard textures

## Known Issues or Limitations
- None currently identified