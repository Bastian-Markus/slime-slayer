<h1>Slime Slayer</h1>
<p>
  Slime slayer is a 2D horde survivor, in which a nameless knight fights endless waves of exponentially growing slime hordes.
</p>
<p>
  This is my first try at making a game and was made in the tiny engine <a href="https://tic80.com/">TIC-80</a>. The goal was to study 2d horde survivor games like brotato and vampire survivors, which turned into this small game.
</p>
<p>
  This game has taught me many things, but before all the importance of working with classes, inheritance and constructors.
</p>

<h2>TIC-80</h2>
<p>
  TIC-80 comes with several technical limitations listed below. I intentionally picked TIC80 to minimize distraction and focus on learning the fundamentals of game development.
</p>
<ul>
  <li><strong>Screen Resolution:</strong> 240 × 136 px</li>
  <li><strong>Code Limit:</strong> Single file, maximum size of 64 KB</li>
  <li><strong>Graphics:</strong> 512 tiles (8×8 px) for sprites and VFX</li>
  <li><strong>Audio:</strong> 4 channels</li>
  <li>and more...</li>
</ul>

<h2>Game Elements</h2>

<h3>Enemies</h3>

- Crawler
    - Simple, slow and tanky, will try to damage the player on contact
- Exploder
    - Red, fast and explosive, will blow up if nearby the player

<h3>Waves</h3>

- Enemies spawn in intervals, with their numbers and strength increasing exponentially over time
- Waves appear from the screens edges

<h3>Progression</h3>

The player progresses by collecting experience points, which are dropped by enemies. On reaching a level up, players get a randomly picked upgrade from below

- Health
- Speed
- PickUpRange
- Attack Damage
- Attack Area
- Attack Speed

<h3>Collectibles</h3>
<p>Collectibles can be dropped by enemies with a certain chance</p>
- Xp-orb
- Heart
- Magnet

<h3>UI</h3>

- Game settings screen
    - Asks the player to select his preferred input method
- Start screen
    - Explains the controls and shows a start hint
- Game screen
    - Game overlay
        - Shows the game UI
    - Pause Overlay
        - Shows current player stats and continue hint
    - Upgrade Overlay
        - Shows 3 upgrade choices and menu navigation hints
- Game over screen
    - Shows enemy kill score and retry hint
