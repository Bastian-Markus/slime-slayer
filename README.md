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

<h2>Gameplay</h2>
<p>
  The
</p>
## Enemies

- Crawler
- Exploder

## Waves

- Enemies spawn in intervals, with their numbers and strength increasing exponentially over time
- Waves appear from the screens edges

## Progression

The player progresses by collecting experience points, which are dropped by enemies. On reaching a level up, players get a randomly picked upgrade from below

- Health
- Speed
- PickUpRange
- Atk Dmg
- Atk Area
- Atk Speed

## Collectibles

- Xp-orb
- Heart
- Magnet

## UI

- Start screen
- Game screen
    - Interface overlay
    - Pause Overlay
        - Shows current player stats and continue hint
    - Upgrade Menu
        - Update scaling display
- Game over screen
    - Shows enemy kill score and retry hint
