// title:   Slime Slayer
// author: 	Bastian Markus
// desc:    An endless horde survival action game about slaying slimes
// script:  js

const difficulties={
	1: {
		text: "Very Easy",
		color: 5
	},
	2: {
		text: "Easy",
		color: 5
	},
	3: {
		text: "Average",
		color: 5
	},
	4: {
		text: "Moderate",
		color: 4
	},
	5: {
		text: "Challenging",
		color: 4
	},
	6: {
		text: "Tough",
		color: 4
	},
	7: {
		text: "Hard",
		color: 3
	},
	8: {
		text: "Deadly",
		color: 3
	},
	9: {
		text: "Brutal",
		color: 3
	},
	10: {
		text: "Merciless",
		color: 3
	},
	11: {
		text: "Nightmare",
		color: 2
	},
	12: {
		text: "Insane",
		color: 2
	},
	13: {
		text: "Impossible",
		color: 2
	},
	14: {
		text: "Good Luck.",
		color: 2
	}
};
const upgradeFactors = {
	health: 1,
	speed: 1.25,
	pickUpRange: 5,
	atkSpeed: 0.75,
	atkDamage: 1.25,
	atkArea: 1.25
};
let t=0;
let tMenu=0;
let camX=0;
let camY=0;
let m=mouse();
let mX=0;
let mY=0;
let gameState="menu";
let score=0;
let highscore=pmem(0);
let inputScheme=0;
let newBest=false;
let player;
let enemies = [];
let enemiesStatic = [];
let collectibles = [];
let waves = [];
let upgradeChoices = [];

const ScaleHandler = {
	scaleValue: 1,
	scaleFactor: 1,
	increment() {
		if (this.scaleValue<14) {
			this.scaleValue += 1;
			this.scaleFactor *= 1.2;
		} else {
			this.scaleFactor *= 1.5;
		};
	}
};

function moveEntity(entity,fromArray,toArray) {
	const index = fromArray.indexOf(entity);
	
	if (index !== -1) {
		fromArray.splice(index, 1);
		toArray.push(entity);
	};
};

function	removeDeadEntities() {
		for (let i=enemies.length-1; i>=0; i--) {
			if (enemies[i].deathDelay===0) {
				enemies.splice(i,1)
			};
		};
		for (let i=enemiesStatic.length-1; i>=0; i--) {
			if (enemiesStatic[i].deathDelay===0) {
				enemiesStatic.splice(i,1)
			};
		};
	};

class Vector2 {
	constructor(x=0,y=0) {
		this.x=x;
		this.y=y;
	};
	add(v) {
		this.x += v.x;
		this.y += v.y;
		return this;
	};
	subtract(v) {
		this.x -= v.x;
		this.y -= v.y;
		return this;
	};
	scale(s) {
		this.x *= s;
		this.y *= s;
		return this;
	};
	length() {
		return Math.sqrt(this.x * this.x + this.y * this.y) ?? 0;
	};
	normalize() {
		let len = this.length();
		if (len === 0) return this;
		this.x /= len;
		this.y /= len;
		return this;
	};
	round(factor) {
		this.x = Math.round(this.x * factor)/factor;
		this.y = Math.round(this.y * factor)/factor;
		return this;
	};
	
	inArea(from,to) {
  let left   = Math.min(from.x, to.x);
	 let right  = Math.max(from.x, to.x);
	 let top    = Math.min(from.y, to.y);
	 let bottom = Math.max(from.y, to.y);
	
  return this.x >= left &&
         this.x <= right &&
         this.y >= top &&
         this.y <= bottom;
	};
};

class Collectible {
	constructor(type,pos) {
		this.type = type;
		this.pos = pos;
		this.distance = new Vector2(0,0);
		this.force = new Vector2(0,0);
		this.collectionRange = 1;
		this.collecting = false;
		this.collected = false;
	};

	update() {
		this.distance = new Vector2(player.pos.x+4-this.pos.x,player.pos.y+4-this.pos.y);
  if (this.collecting) this.applyForce();
		if (!this.collecting && this.distance.length() <= player.pickUpRange) {
			this.collecting = true;
		}
		if (this.distance.length() <= this.collectionRange) {
			this.collect();
		};
	};

	applyForce() {
		const f = new Vector2(this.distance.x,this.distance.y);
		f.normalize().scale(1.5);
		if (f.length() <= 0.1) {
			this.collected = true;
		} else {
			this.pos.add(f);
			this.force = f;
		};
	};

	collect() {
		this.collected = true;

		switch (this.type) {
			case "xp":
				this.collectXp();
				break;
			case "heart":
				this.collectHeart();
				break;
			case "magnet":
				this.collectMagnet();
				break;
		};
	};

	collectMagnet() {
		for (let c of collectibles) {
			if (c.type === "xp") c.collecting = true;
		};
		this.remove();
	};

	collectHeart() {
		player.heal();
		this.remove();
	};

	collectXp() {
		player.addXp();
		sfx(36,"f-7",5,2);
		this.remove();
	};

	draw() {
		switch (this.type) {
			case "xp":
				this.drawXp();
				break;
			case "heart":
				this.drawHeart();
				break;
			case "magnet":
				this.drawMagnet();
				break;
			default:
				break;
		};
	};

	drawXp() {
	const x = this.pos.x - camX - 8;
	const y = this.pos.y - camY - 8;
	const rot = t%30/3;

	spr(259,x,y,0,1,0,rot);
	};

	drawHeart() {
	const x = this.pos.x - camX - 8;
	const y = this.pos.y - camY - 8;

	spr(260,x,y,0);
	};
	
	drawMagnet() {
		const x = this.pos.x - camX - 8;
		const y = this.pos.y - camY - 8;
	
		spr(261,x,y,0);
	};

	remove() {
		for (let i=collectibles.length-1; i>=0; i--) {
			if (collectibles[i].collected===true) {
				collectibles.splice(i,1)
			};
		};
	};
};

class Entity {
	constructor(pos) {
		this.pos = pos;
		this.vel = new Vector2(0,0);

		this.INIT = {
			deathDelay: 15,
			windupTime: 0,
			releaseTime: 0,
			recoveryTime: 30
		};

		this.states = {
			movement: {
				idle: this.stateIdle,
				move: this.stateMove,
			},
			action: {
				none: this.stateNone,
				windup: this.stateWindup,
				release: this.stateRelease,
				recovery: this.stateRecovery
			}
		};
		this.state = {
			movement: "move",
			action: "none"
		};
		this.prev = {
			pos: new Vector2(pos.x,pos.y),
			vel: new Vector2(0,1),
			state: {
				movement: "move",
				action: "none"
			}
		};

		this.distance = new Vector2(0,0);
		this.mouseDist = new Vector2(0,0);
		this.timer = {
			movement: 0,
			action: 0
		};
		this.dying = false;
		this.deathDelay = 15;
		this.windUpTime = 0;
		this.releaseTime = 0;
		this.recoveryTime = 30;
		this.force = new Vector2(0,0);
	};

	update() {
		this.preCompute();
		if (!this.dying) {
			this.updateStates();
			this.states.movement[this.state.movement].call(this);
			this.applyForce();
			this.states.action[this.state.action].call(this);
		} else {
			this.die();
		};
		this.postCompute();
	};

	stateIdle() {};
	stateMove() {};
	stateNone() {};
	stateWindup() {};
	stateRelease() {};
	stateRecovery() {};

	draw() {
		this.drawStates();
	};

	drawStates() {
		switch (this.state.movement) {
			case "idle":
				this.drawMove();
				break;
			case "move":
				this.drawMove();
				break;
		};
		switch (this.state.action) {
			case "none":
				break;
			case "windup":
				this.drawAttack();
				break;
			case "release":
				this.drawAttack();
				break;
			case "recovery":
				this.drawAttack();
				break;
		};
	};

	preCompute() {
		//cache
		const p = this.pos;
		const pPrev = this.prev.pos;
		const pPos = player.pos;

		this.distance = new Vector2(pPos.x-p.x,pPos.y-p.y);
		this.mouseDist = new Vector2(Math.round(player.aimPos.x-p.x),Math.round(player.aimPos.y-p.y));

		pPrev.x = p.x;
		pPrev.y = p.y;

		this.prev.state.movement = this.state.movement;
		this.prev.state.action = this.state.action;
	};

	postCompute() {
		//cache
		const p = this.pos;
		const pPrev = this.prev.pos;
		const v = this.vel;
		const vPrev = this.prev.vel;

		v.x = p.x - pPrev.x;
		v.y = p.y - pPrev.y;
		if (v.x || v.y) {
			vPrev.x = v.x;
			vPrev.y = v.y;
		};

		//update
		this.timer.movement++;
		this.timer.action++;
	};

	hurt(damage) {
		this.health -= damage;
		if (this.health<=0) this.dying = true;
	};

	die() {
		this.dying = true;
		if (this.deathDelay>0) {
			this.deathDelay = Math.max(this.deathDelay-1,0);
		} else {
			score += this.killPoints ?? 0;
		};
	};

	inPlayerRange(r) {
		return this.distance.length()<=r;
	};

	isMoving() {
		let p = new Vector2(this.pos.x,this.pos.y);
		let pPrev = new Vector2(this.prev.pos.x,this.prev.pos.y);
		return p.subtract(pPrev).length() > 0;
	};

	applyForce() {
		const f = new Vector2(this.force.x,this.force.y);
		if (f.length() <= 0.1) {
			this.force = new Vector2(0,0);
		} else {
			f.scale(0.9);
			this.pos.add(f);
			this.force = f;
		};
	};
};

class Player extends Entity {
	constructor(pos) {
		super(pos);

		this.input = new Vector2(0,0);
		this.aimInput = new Vector2(0,0);
		this.speed = 0.75;
		this.maxHealth = 5;
		this.health = 5;
		this.immunity = 0;
		this.scale = 3;
		this.aimOffset = new Vector2(0,0);
		this.aimPos = new Vector2(0,0);
		this.atkSpeed = 60;
		this.atkArea = 30;
		this.atkRange = 25;
		this.atkDamage = 1;
		this.xp = 0;
		this.lvl = 1;
		this.lvlUpCost = 10;
		this.pickUpRange = 25;
		this.pickUpgrade = false;

		this.INIT = {
			deathDelay: 15,
			windupTime: Math.round(this.atkSpeed*0.9),
			releaseTime: 4,
			recoveryTime: Math.round(this.atkSpeed*0.1),
			speed:1,
			health:5,
			maxHealth:5,
			atkSpeed:60,
			atkArea:20,
			atkRange: 25,
			atkDamage:1,
			lvl:1,
			pickUpRange:25
		};
	};

	update() {
		this.preCompute();

		//movement
		this.input.normalize().scale(this.speed);
		this.applyForce();
		this.pos.add(this.input);

		if (this.immunity>0) this.immunity--;

		this.updateStates();
		this.states.movement[this.state.movement].call(this);
		this.states.action[this.state.action].call(this);
		this.postCompute();
	};

	updateStates() {
		if (this.isMoving()) {
			this.state.movement = "move";
		} else {
			this.state.movement = "idle";
		};

		if (this.state.movement !== this.prev.state.movement) this.timer.movement = 0;
		if (this.state.action !== this.prev.state.action) this.timer.action = 0;
	};

	stateIdle() {};
	stateMove() {};
	stateNone() {};

	stateWindup() {
	 if (this.windupTime > 0) {
			this.windupTime--;
		} else if (this.windupTime <= 0) {
			this.state.action = "release";
		};
	};
	stateRelease() {
	 if (this.releaseTime > 0) {
			this.releaseTime--;
		} else if (this.releaseTime <= 0) {
			let targets = [];

			for (let e of enemies) {
				if (e.mouseDist.length() <= this.atkArea) targets.push(e);
			};

			for (let e of targets) {
				const f = e.distance.normalize().scale(-2);
				e.force = f;
				e.hurt(this.atkDamage);
			};
			sfx(62,40,15,3);

			this.state.action = "recovery";
		};
	};
	stateRecovery() {
	 if (this.recoveryTime > 0) {
			this.recoveryTime--;
		} else if (this.recoveryTime <= 0) {
			this.resetActionTimers();
			this.state.action = "none";
		};
	};
	
	drawStates() {
		switch (this.state.movement) {
			case "idle":
				this.drawMove();
				break;
			case "move":
				this.drawMove();
				break;
		};
		switch (this.state.action) {
			case "none":
				break;
			case "windup":
				this.drawWindup();
				break;
			case "release":
				this.drawRelease();
				break;
			case "recovery":
				this.drawRecovery();
				break;
		};
	};

	drawMove() {
		const scale = this.scale;
		const bob = t%30/15;
		const immunity = player.immunity ? t%20/10*3 : 0;
		const x = this.pos.x-4*scale-camX;
		const y = this.pos.y-4*scale-camY+bob;
		const v = this.vel;
		const vPrev = this.prev.vel;

		circb(this.aimOffset.x+120,this.aimOffset.y+68,2,12);

		let sprite;
		if (v.y) {
			sprite = v.y>0 ? 433+(t%30/15) : 449+(t%30/15);
		} else if (vPrev.y) {
			sprite = vPrev.y>0 ? 432 : 448;
		};
		if (v.x) {
			sprite = v.x>0 ? 481+(t%30/15) : 465+(t%30/15);
		} else if (vPrev.x) {
			sprite = vPrev.x>0 ? 480 : 464;
		};
		spr(sprite+immunity,x,y,0,scale,0,0);
	};

	drawWindup() {
		const t = 1-Math.min(this.windupTime/this.INIT.windupTime,1);
		const r = this.atkArea*t;
		const x = this.aimOffset.x+120;
		const y = this.aimOffset.y+68;
		
		circb(x,y,r,14);
	};
	
	drawRelease() {
		const r = this.atkArea;
		const x = this.aimOffset.x+120;
		const y = this.aimOffset.y+68;
	
		circ(x,y,r,14);
	};
	drawRecovery() {
		const t = Math.min(this.recoveryTime/this.INIT.recoveryTime,1);
		const r = this.atkArea*t;
		const x = this.aimOffset.x+120;
		const y = this.aimOffset.y+68;
		
		circb(x,y,r,14);
	};

	hurt(amount) {
		if (!this.immunity) {
			sfx(61,45,-1,1);
			this.health -= amount;
			this.immunity=60;
			if (this.health<1) endGame();
		};
	};
	
	heal(amount = 1) {
		const h = this.health;
		const mH = this.maxHealth;

		if (h < mH) this.health += amount;
	};
	
	addXp(amount=1) {
		const xp = this.xp;
		const lvl = this.lvl;
		const cost = this.lvlUpCost;

		if (xp + amount >= cost) {
			this.levelUp(amount);
		} else {
			this.xp += amount;
		};
	};
	
	levelUp(amount) {
		music(0,0,0,false);
		this.xp += amount;
		this.xp -= this.lvlUpCost;
		this.lvl += 1;
		this.lvlUpCost = 10 * (1 + this.lvl*0.75);
		this.pickUpgrade = true;
		switchPause();

		const initUpgrades = [
			"health",
			"speed",
			"pickUpRange",
			"atkSpeed",
			"atkDamage",
			"atkArea"
		];

		let upgrades = [
			"health",
			"speed",
			"pickUpRange",
			"atkSpeed",
			"atkDamage",
			"atkArea"
		];

		for (let i=0; i < 3; i++) {
			const index = Math.floor(Math.random()*upgrades.length);
			upgradeChoices.push(upgrades[index]);
			upgrades.splice(index,1);
		};
		upgrades = initUpgrades;
	};

	upgrade(type) {
		switch (type) {
			case "health": this.upgradeHealth(); break;
			case "speed": this.upgradeSpeed(); break;
			case "pickUpRange": this.upgradePickUpRange(); break;
			case "atkDamage": this.upgradeAtkDamage(); break;
			case "atkArea": this.upgradeAtkArea(); break;
			case "atkSpeed": this.upgradeAtkSpeed(); break;
		};
	};

	upgradeHealth() {
		this.health+=upgradeFactors.health;
		this.maxHealth+=upgradeFactors.health;
	};
	upgradeSpeed() {
		this.speed*=upgradeFactors.speed;
	};
	upgradePickUpRange() {
		this.pickUpRange+=upgradeFactors.pickUpRange;
	};
	upgradeAtkDamage() {
		this.atkDamage*=upgradeFactors.atkDamage;
	};
	upgradeAtkArea() {
		this.atkArea*=upgradeFactors.atkArea;
	};
	upgradeAtkSpeed() {
		this.atkSpeed*=upgradeFactors.atkSpeed;
		this.INIT.windupTime = Math.round(this.atkSpeed*0.15);
		this.INIT.recoveryTime = Math.round(this.atkSpeed*0.85);
	};

	resetActionTimers() {
	 this.windupTime = this.INIT.windupTime;
		this.releaseTime = this.INIT.releaseTime;
		this.recoveryTime = this.INIT.recoveryTime;
	};
};

class Enemy extends Entity {
	constructor(pos) {
		super(pos);
		this.scaleFactor = ScaleHandler.scaleFactor;
		this.speed = 0.5;
		this.health = 1;
		this.maxHealth = 1;
		this.killPoints = 1;
	};

	updateStates() {
		if (this.inPlayerRange(9) && this.state.action === "none") {
			this.state.action = "windup";
		} else {
			this.state.action = "none";
		};

		this.state.movement = "move";

		if (this.state.movement !== this.prev.state.movement) this.timer.movement = 0;
		if (this.state.action !== this.prev.state.action) this.timer.action = 0;
	};

	moveTowardPlayer() {
		let force = new Vector2(this.distance.x,this.distance.y);
		force.normalize().scale(this.speed);
		this.pos.add(force);
	};

	getMouseRange() {
		return new Vector2(mX - this.pos.x,mY - this.pos.y);
	};
	
	onDeath() {
		const {x,y} = this.pos;
		const rng = Math.random()*100;
		const offset = -5+(Math.random()*5);
		const offset2 = -5+(Math.random()*5);
		
		if (rng<=0.5 && rng>=0) collectibles.push(new Collectible("magnet",new Vector2(x+offset,y+offset)));
		if (rng>1 && rng<=3) collectibles.push(new Collectible("heart",new Vector2(x+offset,y+offset)));
		collectibles.push(new Collectible("xp",new Vector2(x+offset2,y+offset2)));
	};
};

class Exploder extends Enemy {
	constructor(pos) {
		super(pos);

		this.maxHealth = Math.max(Math.floor(1*(this.scaleFactor*0.4)),1);
		this.health = Math.max(Math.floor(1*(this.scaleFactor*0.4)),1);
		this.speed = Math.min(0.2*this.scaleFactor,5);
		this.damage = Math.max(Math.floor(2*(this.scaleFactor*0.25)),2);
		this.atkTime = 60;
		this.deathDelay = 15;
	};
	
	update() {
		this.preCompute();

		this.updateStates();
		this.states.movement[this.state.movement].call(this);
		this.applyForce();
		this.states.action[this.state.action].call(this);

		if (this.dying) this.die();
		this.postCompute();
	};

	updateStates() {
		if (this.inPlayerRange(12) && this.state.action === "none") {
			this.state.action = "release";
		};
		this.state.movement = "move";

		if (this.state.action !== this.prev.state.action) this.timer.action = 0;
	};

	stateMove() {
		this.moveTowardPlayer();
	};

	stateRelease() {
		const progress = this.timer.action/this.atkTime;

		if (progress >= 1) {
			this.dying = true;
		} else if (progress > 0.9) {
			this.killPoints = 0;
			if (this.inPlayerRange(35)) player.hurt(this.damage);
			sfx(63);
		} else if (progress === 0) {
			this.speed = 0;
			moveEntity(this,enemies,enemiesStatic);
		};
	};

	draw() {
		this.drawActionStates();
	};
	
	drawActionStates() {
		const x = this.pos.x - camX - 8
		const y = this.pos.y - camY - 8

		switch (this.state.action) {
			case "none":
				this.drawStates(x,y);
				break;
			case "windup":
				this.drawAttack(x,y);
				break;
			case "release":
				this.drawAttack(x,y);
				break;
			case "recovery":
				this.drawAttack(x,y);
				break;
		};
	};

	drawStates(x,y) {
		if (!this.dying) {
			switch (this.state.movement) {
				case "idle":
					this.drawMove(x,y);
				break;
			 case "move":
					this.drawMove(x,y);
				break;
			};
		} else {
			this.drawDead(x,y);
		};
	};

	drawMove(x,y) {
		spr(496+(t%30)/15|0,x,y,0,2,0,0);
	};

	drawAttack(x,y) {
		const progress=this.timer.action/this.atkTime;
		if (progress>0.75) {
			spr(430,x-12,y-8,0,3,0,0,2,2);
		} else if (progress>0.60) {
			spr(398,x-8,y-4,0,2,0,0,2,2);
		} else if (progress>0.35) {
			spr(366,x-8,y-4,0,2,0,0,2,2);
		} else if (progress>0) {
			spr(334,x-8,y-4,0,2,0,0,2,2);
		};
	};

	drawDead(x,y) {
		if (this.deathDelay<=5) {
			spr(498,x,y,0,2,0,0);
		} else if (this.deathDelay<=10) {
			spr(497,x,y,0,2,0,0);
		} else if (this.deathDelay<=15) {
			spr(496,x,y,0,2,0,0);
		};
	};
};

class Crawler extends Enemy {
	constructor(pos) {
		super(pos)

		this.maxHealth = Math.max(Math.floor(2*(this.scaleFactor*0.4)),2);
		this.health = Math.max(Math.floor(2*(this.scaleFactor*0.4)),2);
		this.speed = Math.min(0.15*this.scaleFactor,4);
		this.damage = Math.max(Math.floor(1*(this.scaleFactor*0.25)),1);
		this.atkTime = 60;
	};

	stateMove() {
		this.moveTowardPlayer();
		if (this.inPlayerRange(7)) {
			player.hurt(this.damage);
			this.state.action = "release";
			this.state.movement = "idle";
		};
	};

	stateRelease() {
		this.timer.action++;
		if (this.timer.action>=this.atkTime) {
			this.timer.action = 0;
			this.state.movement = "move";
		};
	};

	drawStates() {
		const x = this.pos.x - camX - 8
		const y = this.pos.y - camY - 8
		if (!this.dying) {
			switch (this.state.movement) {
				case "idle":
					this.drawMove(x,y);
				break;
			 case "move":
					this.drawMove(x,y);
				break;
			};
			switch (this.state.action) {
				case "none":
				break;
			 case "attack":
				break;
			};
		} else {
			this.drawDead(x,y);
		}
	};

	drawMove(x,y) {
		spr(499+(t%30)/15|0,x,y,0,2,0,0);
	};

	drawDead(x,y) {
		if (this.deathDelay<=5) {
			spr(501,x,y,0,2,0,0);
		} else if (this.deathDelay<=10) {
			spr(500,x,y,0,2,0,0);
		} else if (this.deathDelay<=15) {
			spr(499,x,y,0,2,0,0);
		};
	};
};

const WaveHandler = {
	wave: {
		dur: 0,
		breakDur: 120
	},
	get scale() {return ScaleHandler.scaleValue},
	get scaleFactor() {return ScaleHandler.scaleFactor},
	get randPos() {
		return {
			x: Math.floor(240*Math.random()),
			y: Math.floor(136*Math.random())
		};
	},
	get spawnDirections() {
		return {
			left: new Vector2(camX-10,camY+this.randPos.y),
			right: new Vector2(camX+250,camY+this.randPos.y),
			up: new Vector2(camX+this.randPos.x,camY-10),
			down: new Vector2(camX+this.randPos.x,camY+146)
		};
	},
	get waveMult() {
		return 1;
	},
	get enemyAmount() {
		return 10 + Math.round((this.scaleFactor*14)*this.waveMult);
	},
	enemyTypes: {
		exploder: Exploder,
		crawler: Crawler
	},
	get possibleTypes() {
		if (this.scale<4) {
			return ["crawler"];
		} else {
			return ["crawler","exploder"];
		};
	},
	get randType() {
		return this.possibleTypes[Math.floor(Math.random()*this.possibleTypes.length)];
	},
	get possibleDirections() {
		let options = ["left","right","up","down"];
		const pickAmount = Math.floor(3*(this.scale/14))+1;
		let result = [];
		for (let i=0; i<pickAmount; i++) {
			const randPick = Math.floor(Math.random()*options.length);
			result.push(options[randPick]);
			options.splice(randPick,1);
		};
		return result;
	},

	update() {
		if (this.wave.breakDur) {
			this.wave.breakDur--;
			if (this.wave.breakDur<=0) this.setWave();
		} else {
			this.spawnWrapper();
			
			this.wave.dur--;
			if (this.wave.dur<=0) this.setBreak();
		};
	},

	spawnWrapper() {
		const dir = this.possibleDirections[0];
		const pos = this.spawnDirections[dir];

	 const result = this.wave.enemyAmount/this.wave.dur;
	 this.wave.enemiesPerTick+=result;
	 const ePTFloored = Math.floor(this.wave.enemiesPerTick);
	 this.wave.enemyAmount -= ePTFloored;
	 this.wave.enemiesPerTick -= ePTFloored;
	 
	 for (let i=0; i < ePTFloored; i++) {
	  this.spawnEnemy(this.randType,pos);
	 };
	},

	spawnEnemy(type,pos) {
		enemies.push(
			new this.enemyTypes[type](pos)
		);
	},

	setWave() {
		this.wave = {
			dur: 180 + Math.floor(Math.random()*300),
			enemyAmount: this.enemyAmount,
			enemiesPerTick: 0
		};
	},

	setBreak() {
		this.wave = {
			breakDur: 180 + Math.floor(Math.random()*60)
		};
	}
};

function TIC() {
	m = mouse();
	switch (gameState) {
		case "menu":
			if (!inputScheme) {
				inputTypeLoop();
			} else {
				menuLoop();
			};
		break;
		case "running":
			gameLoop();
		break;
		case "paused":
			if (player.pickUpgrade) {
				upgradeLoop();
			} else {
				pauseLoop();
			};
		break;
		case "over":
			endLoop();
		break;
	};
};

function inputKeyboardMouse() {
	player.input = new Vector2(0,0);

	if (key(23)) Math.min(player.input.y--,0);
	if (key(19)) Math.max(player.input.y++,1);
	if (key(1)) Math.min(player.input.x--,0);
	if (key(4)) Math.max(player.input.x++,1);

	if (keyp(64)) switchPause();

	//mouse aim
	let playerMouseDist = new Vector2(Math.round(mX-player.pos.x),Math.round(mY-player.pos.y));
	if (playerMouseDist.length() >= player.atkRange) {
		player.aimOffset = playerMouseDist.normalize().scale(player.atkRange);
		player.aimOffset = new Vector2(player.aimOffset.x,player.aimOffset.y);
		player.aimPos = new Vector2(player.pos.x+player.aimOffset.x,player.pos.y+player.aimOffset.y);
	} else {
		player.aimOffset = new Vector2(mX-player.pos.x,mY-player.pos.y);
		player.aimPos = new Vector2(player.pos.x+player.aimOffset.x,player.pos.y+player.aimOffset.y);
	};
	
	if (m[2] && player.state.action === "none") {
		player.state.action = "windup";
	};
};

function inputKeyboard() {
	player.input = new Vector2(0,0);
	player.aimInput = new Vector2(0,0);

	//movement
	if (key(23)) player.input.y = -1;
	if (key(19)) player.input.y = 1;
	if (key(1))  player.input.x = -1;
	if (key(4))  player.input.x = 1;

	//aim
	if (btn(0)) player.aimInput.y = -1;
	if (btn(1)) player.aimInput.y = 1;
	if (btn(2)) player.aimInput.x = -1;
	if (btn(3)) player.aimInput.x = 1;
	player.aimInput.normalize().scale(player.atkRange);
	player.aimOffset = new Vector2(player.aimInput.x,player.aimInput.y);
	player.aimPos = new Vector2(player.pos.x+player.aimOffset.x,player.pos.y+player.aimOffset.y);
	
	if (keyp(64)) switchPause();
	
	if (key(48) && player.state.action === "none") {
		player.state.action = "windup";
	};
};

function inputPaused() {
	if (keyp(64)) switchPause();
};

function pushApart(a,b,minDist) {
 let dx = a.pos.x - b.pos.x;
 let dy = a.pos.y - b.pos.y;

 let distSq = dx*dx + dy*dy;
 let minDistSq = minDist * minDist;

 if (distSq === 0 || distSq >= minDistSq) return;

 let overlapRatio = (minDistSq - distSq) / minDistSq;

 a.pos.x += dx * overlapRatio * 0.5;
 a.pos.y += dy * overlapRatio * 0.5;

 b.pos.x -= dx * overlapRatio * 0.5;
 b.pos.y -= dy * overlapRatio * 0.5;
};

function inputTypeLoop() {
	let bob = tMenu%60/30;
	let bob2 = (30+tMenu)%60/30;
	let scale = 2;
	cls(0);

	spr(0,120-(20*scale),38-(12*scale),15,scale,0,0,5,3);
	spr(499+tMenu%60/30,60-(4*scale),25,15,scale);
	spr(499+tMenu%60/30,180-(4*scale),25,15,scale);
	let width0 = print("Select your preferred input type:",-100,-100);
	print("Select your preferred input type:",120-width0/2,82,13);

	const width1=print("[Press 1] ",-100,-100);
	print("[Press 1] ",53-width1/2,101+bob,12);
	print("Keyboard and Mouse",53+width1/2,101,13);
	const width2=print("[Press 2] ",-100,-100);
	print("[Press 2] ",53-width2/2,117+bob2,12);
	print("Keyboard",53+width2/2,117,13);

	tMenu++;
	if (keyp(28)) {
		inputScheme = 1;
		sfx(2,45,8);
	};
	if (keyp(29)) {
		inputScheme = 2;
		sfx(2,45,8);
	};
};

function menuLoop() {
	let bob = tMenu%60/30;
	let scale = 2;
	cls(0);

	spr(499+tMenu%60/30,120-(4*scale),8,15,scale);
	spr(0,120-(20*scale),53-(12*scale),15,scale,0,0,5,3);
	let width = print("Press SPACE to start",-100,-100);
	print("Press SPACE to start",120-width/2,88+bob,12);
	
	if (inputScheme===1) {
		spr(50,5,116,15,1,0,0,2,2);
		print("to attack / aim",23,123,14,false,1,true);
		for (let i=0;i<4;i++) {
			spr(48,145+i*16,118,15,1,0,0,2,2)
			spr(80+i,145+4+i*16,117+4,15,1,0);
		};
		print("to move",212,123,14,false,1,true);
		
		spr(54,145,103,15,1,0,0,4,2);
		print("to pause",179,108,14,false,1,true);
	} else {
		for (let i=0;i<4;i++) {
			spr(48,145+i*16,118,15,1,0,0,2,2)
			spr(80+i,145+4+i*16,117+4,15,1,0);
		};
		print("to move",212,123,14,false,1,true);
		
		for (let i=0;i<4;i++) {
			spr(48,5+i*16,118,15,1,0,0,2,2)
			spr(96+i,5+4+i*16,117+4,15,1,0);
		};
		print("to aim",72,123,14,false,1,true);
		
		spr(54,5,100,15,1,0,0,4,2);
		print("to pause",39,105,14,false,1,true);
		
		spr(58,145,100,15,1,0,0,4,2);
		print("to attack",179,105,14,false,1,true);
	};

	tMenu++;
	if (keyp(48)) {
	sfx(2,24,15);
	gameState="running";
	player = new Player(new Vector2(116,64));
	player.resetActionTimers();
	};
};

function gameLoop() {
	if (t > 15) {
		if (inputScheme === 1) {
			inputKeyboardMouse();
		} else {
			inputKeyboard();
		};	
	};

	update();
	draw();

	t++;
};

function switchPause() {
	tMenu = 0;
	cls();
	sfx(2,24,15);
	if (vbank() === 1) {
		vbank(0);
		gameState = "running";
	} else {
		vbank(1);
		gameState = "paused";
	};
};

function pauseLoop() {
	inputPaused();
	drawPause();
	
	tMenu++;
};

function upgradeLoop() {

	drawUpgrade(upgradeChoices);

	tMenu++;
};

function drawPause() {
	let bob = tMenu%90/45;
	camX = player.pos.x-120;
	camY = player.pos.y-68;
	mX = m[0]+camX;
	mY = m[1]+camY;

	cls();

	drawBg();

	player.draw();
	
	collectibles.sort((a, b) => a.pos.y - b.pos.y);
 for (let c of collectibles) {
		c.draw();
	};

	enemies.sort((a, b) => a.pos.y - b.pos.y);
 for (let e of enemies) {
		e.draw();
	};

	drawInterface();

	rect(0,88,240,48,0);
	rectb(0,88,240,48,14);

	let width = print("Press SHIFT to continue",-100,-100);
	print("Press SHIFT to continue",120-width/2,68+bob,12);

	let {health,maxHealth,speed,pickUpRange,atkDamage,atkArea,atkSpeed,lvl,INIT} = player;

	print("Player Status:",5,93,14,false,1,false);
	let lvlOffset = print(lvl,0,-100,13,false,1,false);
	print("Level: ",198-lvlOffset,93,14,false,1,false);
	print(lvl,235-lvlOffset,93,12,false,1,false);

	print("Health: "+Math.round(health)+" / "+Math.round(maxHealth),5,105,13,false,1,true);
	print("Speed: "+Math.round(speed*100)/100,5,115,13,false,1,true);
	print("Pickup Range: "+Math.round(pickUpRange*100)/100,5,125,13,false,1,true);
	
	print("Attack Damage: "+Math.round(atkDamage*100)/100,120,105,13,false,1,true);
	print("Attack Area: "+Math.round(atkArea*100)/100,120,115,13,false,1,true);
	print("Attack Speed: "+Math.round((atkSpeed/INIT.atkSpeed)*10)/10,120,125,13,false,1,true);

	tMenu++;
};

let upgradePick = 1;
function drawUpgrade(choices) {
	updateSelection();
	const upgrades = {
		"health": {
			text: "Health",
			icon: 368,
			flavor: "+1"
		},
		"speed": {
			text: "Speed",
			icon: 369,
			flavor: "+10%"
		},
		"pickUpRange": {
			text: "Pickup Range",
			icon: 370,
			flavor: "+20%"
		},
		"atkDamage": {
			text: "Attack Damage",
			icon: 371,
			flavor: "+10%"
		},
		"atkArea": {
			text: "Attack Area",
			icon: 372,
			flavor: "+10%"
		},
		"atkSpeed": {
			text: "Attack Speed",
			icon: 373,
			flavor: "+10%"
		},
	};
	let bob = tMenu%90/45;

	camX = player.pos.x-120;
	camY = player.pos.y-68;
	mX = m[0]+camX;
	mY = m[1]+camY;

	cls();

	drawBg();

	collectibles.sort((a, b) => a.pos.y - b.pos.y);
 for (let c of collectibles) {
		c.draw();
	};

	enemies.sort((a, b) => a.pos.y - b.pos.y);
 for (let e of enemies) {
		e.draw();
	};

	drawInterface();
	
	//upgrade menu title
	spr(5,120-65,5,0,2,0,0,9,2);

	for (let i=0; i < choices.length; i++) {
		rect(20+(70*i),33,60,70,0);
		rectb(20+(70*i),33,60,70,4);
		if (upgradePick === i) {
			rectb(19+(70*i),32,62,72,4);
			rectb(18+(70*i),31,64,74,4);
		};

		
		const upgrade = upgrades[choices[i]];
		const offset = print(upgrade.text,-100,-100,12,false,1,true)/2;
		print(upgrade.text,51+(70*i)-offset,37,4,false,1,true);
		
		spr(upgrade.icon,35+(70*i),50,0,4);
		
		const offset2 = print(upgrade.flavor,-100,-100,12,false,1,true)/2;
		print(upgrade.flavor,51+(70*i)-offset2,92,4,false,1,true);
	};
	
	//scroll hints
	spr(52,0+bob,68-4,0,1,0,0,2,2); //left
	spr(81,6+bob,67,0);

	spr(52,225-bob,68-4,0,1,1,0,2,2); //right
	spr(83,226-bob,67,0);

	let width = print("Press SPACE to select an UPGRADE!",-100,-100);
	print("Press SPACE to select an UPGRADE!",120-width/2,112+bob,12);

	if (keyp(48)) {
		player.upgrade(choices[upgradePick]);
		player.pickUpgrade = false;
		upgradeChoices = [];
		switchPause();
	};

	tMenu++;
};

function updateSelection() {
	if (keyp(1) && upgradePick > 0) upgradePick--;
	if (keyp(4) && upgradePick < 2) upgradePick++;
};

function endLoop() {
	let bob = tMenu%90/45;
	cls(0);
	let color = 13;
	const width=print("You died.",-10000,-10000);
	spr(262,105,18,-1,3);
	print("You died.",120-(width/2),48,12);
	if (newBest) {
		const offsetS = print("Score: " + pmem(0)+ " Kills!",-100,-100,4)/2;
		print("Score: " + pmem(0)+ " Kills!",120-offsetS,63,4);
		const offsetT = print("NEW BEST!",-100,-100,4)/2;
		print("NEW BEST!",120-offsetT,73,4);
	}	else {
		const offsetHs = print("Highscore: " + pmem(0),-100,-100)/2;
		print("Highscore: " + pmem(0),120-offsetHs,63,12);
	 const offsetS = print("Your Score: " + score,-100,-100)/2;
		print("Your Score: " + score,120-offsetS,78,13);
	};

	const widthRetry = print("Press SPACE to retry",-100,-100);
	print("Press SPACE to retry",120-widthRetry/2,98+bob,12);

	tMenu++;
	if (keyp(48)) reset();
};

function update() {
	if (t>50 && t%1200===0) ScaleHandler.increment();

	WaveHandler.update();

	player.update();

 for (let i=0; i<enemies.length; i++) {
 	const e = enemies[i];
 	e.update();
  if (e.deathDelay === 0) {
   if (e.killPoints) e.onDeath();
			e.die();
  };
  for (let j=i+1; j<enemies.length; j++) {
  	pushApart(enemies[i],enemies[j],9);
  };
 };

 for (let eS of enemiesStatic) {
 	eS.update();
  if (eS.deathDelay === 0) {
   if (eS.killPoints) eS.onDeath();
			eS.die();
  };
 };

 for (let c of collectibles) {
 	c.update();
 };

 removeDeadEntities();
};

function draw() {
	camX = player.pos.x-120;
	camY = player.pos.y-68;
	mX = m[0]+camX;
	mY = m[1]+camY;

	cls();

	drawBg();

	player.draw();
	
	collectibles.sort((a, b) => a.pos.y - b.pos.y);
 for (let c of collectibles) {
		c.draw();
	};

	enemies.sort((a, b) => a.pos.y - b.pos.y);
 for (let e of enemies) {
		e.draw();
	};
	for (let eS of enemiesStatic) {
		eS.draw();
	};

	drawInterface();

	//debug();
};

function drawBg() {
	let pos = player.pos;
	let mapX;
	let mapY;

	mapX = pos.x>=0 ? 240-(pos.x%240) : -(pos.x%240);
	mapY = pos.y>=0 ? 136-(pos.y%136) : -(pos.y%136);

	map(0,0,29,16,mapX,mapY);
	map(0,0,29,16,mapX-240,mapY-136);
	map(0,0,29,16,mapX-240,mapY);
	map(0,0,29,16,mapX,mapY-136);
};

function drawInterface() {
	let pos = player.pos;
	let mH = player.maxHealth;
	let h = player.health;
	let xp = player.xp / player.lvlUpCost * 30;
	let lvl = player.lvl;

	//max health
	for (let i=0; i<mH; i++) {
		spr(258,5+i*10,5,0)
	};
	//health
	for (let i=0; i<h; i++) {
		spr(256,5+i*10,5,0)
	};
	//max xp
	for (let i=0; i<30; i++) {
		spr(273,i*8,131,0);
	};
	//xp
	for (let i=0; i<xp; i++) {
		spr(272,i*8,131,0);
	};
	const offset = print(lvl,-100,-100);
	print(lvl,120-offset,125,12);
	//show difficulty
	const diffVal = ScaleHandler.scaleValue
	const diff = difficulties[diffVal];
	const diffBob= diffVal>13 ? t%10/5 : 0;
	const diffOffset = print(diff.text,-100,-100);
	print(diff.text,239-diffOffset,5+diffBob,diff.color);
	//show kills
	let color = score > highscore ? 4 : 13;

	let scoreOffset = print(score,-100,-100);
	spr(262,230,14,0);
	print(score,229-scoreOffset,15,color)

	//attack Windup
	if (player.charge>0) {
		const c = player.charge / player.chargeMax;
		const cCurrent = Math.floor(c*player.charges);
		const offset = (6*player.charges)/2;
		//Max Charges
		for (let i=0; i<player.charges; i++) {
			spr(260,120+i*6-offset,50,0);
		};
		for (let i=0; i<cCurrent; i++) {
			spr(261,120+i*6-offset,50,0);
		};
	};
};

function endGame() {
	if (score > highscore) {
		pmem(0,score);
		newBest = true;
	};
	music(1,0,0,false);
	gameState="over";
};

function debug() {
	if (t>1) {
		let e = enemies[0] ?? 0;

		print(JSON.stringify(player),5,25,13);
		print(JSON.stringify(enemies[0]),5,35,13);
		print("Enemy Count: "+enemies.length,5,45,13);
		print("Enemy Static Count: "+enemiesStatic.length,5,55,13);
		print("Collectible Count: "+collectibles.length,5,65,13);
		print("Aim Pos: "+player.aimPos.x+" "+player.aimPos.y,5,75,13);
		print("Scale Factor: "+ScaleHandler.scaleFactor,5,85,13);

		print(m[0]+" "+m[1],5,115,13);
	};
};
