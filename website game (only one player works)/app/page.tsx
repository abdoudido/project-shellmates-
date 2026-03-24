'use client';

import { useState, useEffect } from 'react';
import './game.css';

const CHARACTER_CLASSES = {
  'Knight': { 
    sprite: 'url("https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Character%207%20_%20Knight%201-nPugyGXBdKdNI6GkRAp80TOBtj6lGW.png")',
    stats: { hp: 130, damage: 15, defense: 25 }, 
    desc: 'Tank with Heavy Shield',
    fullDesc: 'HP: 130 | DMG: 15 | DEF: 25 | Weapon: Shield & Sword'
  },
  'Ninja Peasant': { 
    sprite: 'url("https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Character%2014%20_%20Ninja%20Peasant-FyjVtCwlY5aba3dc06Zxbp9agTDhJP.png")',
    stats: { hp: 70, damage: 30, defense: 10 }, 
    desc: 'High Damage Striker',
    fullDesc: 'HP: 70 | DMG: 30 | DEF: 10 | Weapon: Sword Only'
  },
  'Fighter': { 
    sprite: 'url("https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Character%201%20_%20Fighter-SMJokJADBmmwC55IHlZZZWB4KoaXFE.png")',
    stats: { hp: 100, damage: 20, defense: 15 }, 
    desc: 'Balanced Warrior',
    fullDesc: 'HP: 100 | DMG: 20 | DEF: 15 | Weapon: Sword & Wand'
  },
};

const WEAPONS = {
  'Dragon Slayer': { type: 'sword', desc: 'Long Sword' },
  'Oak Wall': { type: 'shield', desc: 'Shield' },
  'Astral Wand': { type: 'wand', desc: 'Wand' },
};

const UPGRADES = {
  sword: [
    { name: 'Sharpen Blade', bonus: 'damage', value: 10, desc: 'More damage' },
    { name: 'Training Day', bonus: 'crit_window', value: 15, desc: 'Bigger crit window' }
  ],
  shield: [
    { name: 'Heavy Armor', bonus: 'defense', value: 15, desc: 'More defense' },
    { name: 'Parry Training', bonus: 'parry_window', value: 20, desc: 'Bigger parry window' }
  ],
  wand: [
    { name: 'Upgraded Wand', bonus: 'team_boost', value: 20, desc: 'Team damage +20%' },
    { name: 'Healing Spell', bonus: 'healing', value: 50, desc: 'Healing spell' }
  ]
};

export default function Game() {
  const [state, setState] = useState({
    mainCharacter: null,
    team: [],
    bossHP: 120,
    parryActive: false,
    gameStarted: false,
    currentEvent: null,
    currentUpgradeIndex: 0,
  });

  const [gameState, setGameState] = useState('class-select');
  const [selectedClass, setSelectedClass] = useState('Fighter');
  const [playerName, setPlayerName] = useState('');
  const [playerDOB, setPlayerDOB] = useState('');
  const [playerGender, setPlayerGender] = useState('Male');
  const [soloMode, setSoloMode] = useState(null);
  const [dialogText, setDialogText] = useState('Choose your class to begin your journey!');
  const [activeAction, setActiveAction] = useState(null);
  const [showEventBar, setShowEventBar] = useState(false);
  const [sliderPos, setSliderPos] = useState(0);
  const [showSlider, setShowSlider] = useState(false);
  const [eventTimeout, setEventTimeout] = useState(null);
  const [teamMemberCount, setTeamMemberCount] = useState(0);
  const [currentTeamName, setCurrentTeamName] = useState('');

  useEffect(() => {
    if (!showSlider) return;
    let pos = 0;
    const interval = setInterval(() => {
      pos = (pos + 2) % 300;
      setSliderPos(pos);
    }, 30);
    return () => clearInterval(interval);
  }, [showSlider]);

  const showEventMessage = (message, duration = 2500) => {
    setDialogText(message);
    setShowEventBar(true);
    const timeout = setTimeout(() => {
      setShowEventBar(false);
    }, duration);
    setEventTimeout(timeout);
  };

  const goToPersonalInfo = () => {
    setGameState('personal-info');
    setDialogText('Enter your character information:');
  };

  const confirmPersonalInfo = () => {
    if (!playerName.trim() || !playerDOB.trim()) {
      alert('Please fill all fields!');
      return;
    }
    
    const classStats = CHARACTER_CLASSES[selectedClass].stats;
    setState(prev => ({
      ...prev,
      mainCharacter: {
        name: playerName,
        class: selectedClass,
        dob: playerDOB,
        gender: playerGender,
        hp: classStats.hp,
        maxHP: classStats.hp,
        damage: classStats.damage,
        defense: classStats.defense,
        sprite: CHARACTER_CLASSES[selectedClass].sprite,
        weapon: null,
        upgrades: []
      }
    }));
    
    setGameState('solo-choice');
    setDialogText('Fight alone or with a team?');
  };

  const chooseSolo = () => {
    setSoloMode(true);
    setState(prev => ({
      ...prev,
      mainCharacter: {
        ...prev.mainCharacter,
        weapon: ['Dragon Slayer', 'Astral Wand']
      }
    }));
    startUpgrades();
  };

  const chooseTeam = () => {
    setSoloMode(false);
    setTeamMemberCount(0);
    setGameState('team-member-name');
    setCurrentTeamName('');
    setDialogText('Team Member 1/3 - Enter name:');
  };

  const addTeamMemberName = () => {
    if (!currentTeamName.trim()) {
      alert('Please enter a name!');
      return;
    }
    setGameState('team-member-class');
    setSelectedClass('Fighter');
    setDialogText(`${currentTeamName} - Choose your class:`);
  };

  const confirmTeamMemberClass = () => {
    const classStats = CHARACTER_CLASSES[selectedClass].stats;
    
    // Assign weapons based on class
    let weaponArray = [];
    if (selectedClass === 'Knight') {
      weaponArray = ['Dragon Slayer', 'Oak Wall'];
    } else if (selectedClass === 'Ninja Peasant') {
      weaponArray = ['Dragon Slayer'];
    } else if (selectedClass === 'Fighter') {
      weaponArray = ['Dragon Slayer', 'Astral Wand'];
    }
    
    const newMember = {
      name: currentTeamName,
      class: selectedClass,
      hp: classStats.hp,
      maxHP: classStats.hp,
      damage: classStats.damage,
      defense: classStats.defense,
      sprite: CHARACTER_CLASSES[selectedClass].sprite,
      weapon: weaponArray,
      upgrades: []
    };
    
    setState(prev => ({
      ...prev,
      team: [...prev.team, newMember]
    }));
    
    const newCount = teamMemberCount + 1;
    setTeamMemberCount(newCount);
    setCurrentTeamName('');
    
    if (newCount < 3) {
      setGameState('team-member-name');
      setDialogText(`Team Member ${newCount + 1}/3 - Enter name (or skip):`);
    } else {
      setGameState('team-ready');
      setDialogText('Team complete! Ready to choose upgrades?');
    }
  };

  const skipMoreTeamMembers = () => {
    setGameState('team-ready');
    setDialogText('Team complete! Ready to choose upgrades?');
  };

  const startUpgrades = () => {
    setGameState('upgrades');
    const totalChars = soloMode ? 1 : state.team.length + 1;
    const firstChar = state.mainCharacter;
    setDialogText(`${firstChar.name} - Choose an upgrade (${1}/${totalChars})`);
    setState(prev => ({
      ...prev,
      currentUpgradeIndex: 0
    }));
  };

  const applyUpgrade = (upgrade) => {
    const isMainChar = state.currentUpgradeIndex === 0;
    const totalChars = soloMode ? 1 : state.team.length + 1;
    
    setState(prev => {
      const newState = { ...prev };
      if (isMainChar) {
        newState.mainCharacter.upgrades = [...(newState.mainCharacter.upgrades || []), upgrade];
      } else {
        newState.team[state.currentUpgradeIndex - 1].upgrades = [...(newState.team[state.currentUpgradeIndex - 1].upgrades || []), upgrade];
      }
      return newState;
    });

    const nextIndex = state.currentUpgradeIndex + 1;
    if (nextIndex < totalChars) {
      const nextChar = nextIndex === 0 ? state.mainCharacter : state.team[nextIndex - 1];
      setDialogText(`${nextChar.name} - Choose an upgrade (${nextIndex + 1}/${totalChars})`);
      setState(prev => ({ ...prev, currentUpgradeIndex: nextIndex }));
    } else {
      startBattle();
    }
  };

  const startBattle = () => {
    setGameState('battle');
    setDialogText('💀 THE DREADLORD EMERGES! Fear consumes the air... FIGHT OR PERISH! ⚔️');
    setShowEventBar(true);
    setState(prev => ({ ...prev, gameStarted: true }));
  };

  const performAttack = (type) => {
    if (type === 'sword') {
      setShowSlider(true);
      setShowEventBar(false);
      setDialogText('Tap SLASH when the bar hits the red zone!');
      setActiveAction('sword-attack');
    } else if (type === 'shield') {
      setShowEventBar(false);
      setDialogText('🛡️ Preparing to parry... Ready!');
      setTimeout(() => {
        setState(prev => ({ ...prev, parryActive: true }));
        setShowEventBar(true);
        setActiveAction('parry-window');
      }, 1500);
    } else if (type === 'wand') {
      setShowEventBar(false);
      setDialogText('✨ Casting team boost spell!');
      const boostDmg = 15;
      setState(prev => ({ ...prev, bossHP: Math.max(0, prev.bossHP - boostDmg) }));
      setTimeout(() => {
        setShowEventBar(true);
        setDialogText('Team damage +20%! Boss turn!');
        setTimeout(() => {
          bossTurn();
        }, 1500);
      }, 1500);
    }
  };

  const resolveSlash = () => {
    setShowSlider(false);
    const isCrit = sliderPos >= 100 && sliderPos <= 180;
    const dmg = isCrit ? 75 : 35;
    
    if (isCrit) {
      setDialogText('⭐ CRITICAL HIT! Massive damage!');
    } else {
      setDialogText('Good hit! Decent damage!');
    }

    setState(prev => ({ ...prev, bossHP: Math.max(0, prev.bossHP - dmg) }));
    
    setTimeout(() => {
      if (state.bossHP - dmg <= 0) {
        setShowEventBar(true);
        setGameState('victory');
        setDialogText('✨ THE DREADLORD SHATTERS! VICTORY IS YOURS!');
      } else {
        bossTurn();
      }
    }, 1500);
  };

  const bossTurn = () => {
    setActiveAction(null);
    setShowEventBar(true);
    setDialogText('💀 THE DREADLORD UNLEASHES A DEVASTATING ATTACK!');
    
    setTimeout(() => {
      const damage = 20;
      
      setState(prev => {
        let anyoneAlive = false;
        const newState = { ...prev };
        
        // Damage main character
        const newMainHP = Math.max(0, newState.mainCharacter.hp - damage);
        newState.mainCharacter = { ...newState.mainCharacter, hp: newMainHP };
        if (newMainHP > 0) anyoneAlive = true;
        
        // Damage all team members
        newState.team = newState.team.map(member => ({
          ...member,
          hp: Math.max(0, member.hp - Math.floor(damage * 0.8))
        }));
        
        if (newState.team.some(m => m.hp > 0)) anyoneAlive = true;
        
        return newState;
      });
      
      setTimeout(() => {
        if (!state.mainCharacter || state.mainCharacter.hp - damage <= 0) {
          setGameState('defeat');
          setDialogText('💀 DARKNESS CONSUMES YOUR TEAM... DEFEAT!');
          setShowEventBar(true);
        } else {
          setDialogText('Your team survives! Choose your next action!');
          setShowEventBar(true);
        }
      }, 500);
    }, 1500);
  };

  const getWeaponActions = () => {
    if (!state.mainCharacter?.weapon || !Array.isArray(state.mainCharacter.weapon)) return null;
    
    const actions = [];
    
    if (state.mainCharacter.weapon.includes('Dragon Slayer')) {
      actions.push(
        <button key="slash" onClick={() => performAttack('sword')} className="btn event-btn">
          SLASH
        </button>
      );
    }
    
    if (state.mainCharacter.weapon.includes('Oak Wall')) {
      actions.push(
        <button key="parry" onClick={() => performAttack('shield')} className="btn event-btn">
          PARRY
        </button>
      );
    }
    
    if (state.mainCharacter.weapon.includes('Astral Wand')) {
      actions.push(
        <button key="wand" onClick={() => performAttack('wand')} className="btn event-btn">
          SPELL
        </button>
      );
    }
    
    return actions;
  };

  const getScreenContent = () => {
    switch (gameState) {
      case 'class-select':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '5px' }}>
              {Object.entries(CHARACTER_CLASSES).map(([cls, data]) => (
                <button
                  key={cls}
                  onClick={() => setSelectedClass(cls)}
                  className="btn"
                  style={{ opacity: selectedClass === cls ? 1 : 0.5, padding: '10px' }}
                >
                  <div>{cls}</div>
                  <div style={{ fontSize: '9px', marginTop: '3px', opacity: 0.8 }}>{data.fullDesc}</div>
                </button>
              ))}
            </div>
            <button onClick={goToPersonalInfo} className="btn">
              Next
            </button>
          </div>
        );

      case 'personal-info':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <input
              type="text"
              placeholder="Name"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="input"
            />
            <input
              type="date"
              value={playerDOB}
              onChange={(e) => setPlayerDOB(e.target.value)}
              className="input"
            />
            <select
              value={playerGender}
              onChange={(e) => setPlayerGender(e.target.value)}
              className="input"
            >
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>
            <button onClick={confirmPersonalInfo} className="btn">
              Confirm
            </button>
          </div>
        );

      case 'solo-choice':
        return (
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={chooseSolo} className="btn">
              Go Solo (Sword + Wand)
            </button>
            <button onClick={chooseTeam} className="btn">
              Build Team (Sword Only)
            </button>
          </div>
        );

      case 'team-member-name':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <input
              type="text"
              placeholder="Team member name"
              value={currentTeamName}
              onChange={(e) => setCurrentTeamName(e.target.value)}
              className="input"
            />
            <button onClick={addTeamMemberName} className="btn">
              Next
            </button>
            {teamMemberCount > 0 && (
              <button onClick={skipMoreTeamMembers} className="btn">
                Skip - Proceed to Upgrades
              </button>
            )}
          </div>
        );

      case 'team-member-class':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '5px' }}>
              {Object.entries(CHARACTER_CLASSES).map(([cls, data]) => (
                <button
                  key={cls}
                  onClick={() => setSelectedClass(cls)}
                  className="btn"
                  style={{ opacity: selectedClass === cls ? 1 : 0.5, padding: '10px' }}
                >
                  <div>{cls}</div>
                  <div style={{ fontSize: '9px', marginTop: '3px', opacity: 0.8 }}>{data.fullDesc}</div>
                </button>
              ))}
            </div>
            <button onClick={confirmTeamMemberClass} className="btn">
              Confirm
            </button>
          </div>
        );

      case 'team-ready':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ fontSize: '11px', color: '#d81b60' }}>
              Team Members: {state.team.length}/3
            </div>
            {state.team.map((member, idx) => (
              <div key={idx} style={{ fontSize: '10px', color: '#a020f0', padding: '6px 8px', background: 'rgba(160, 32, 240, 0.2)', borderRadius: '3px' }}>
                {member.name} - {member.class}
              </div>
            ))}
            <button onClick={() => startUpgrades()} className="btn">
              Proceed to Upgrades
            </button>
          </div>
        );

      case 'upgrades':
        const currentChar = state.currentUpgradeIndex === 0 ? state.mainCharacter : state.team[state.currentUpgradeIndex - 1];
        let weaponType = 'sword';
        if (Array.isArray(currentChar?.weapon)) {
          if (currentChar.weapon.includes('Dragon Slayer')) weaponType = 'sword';
          else if (currentChar.weapon.includes('Oak Wall')) weaponType = 'shield';
          else if (currentChar.weapon.includes('Astral Wand')) weaponType = 'wand';
        }
        const upgrades = UPGRADES[weaponType] || [];

        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {upgrades.map((upgrade, idx) => (
              <button
                key={idx}
                onClick={() => applyUpgrade(upgrade)}
                className="btn"
              >
                {upgrade.name}: {upgrade.desc}
              </button>
            ))}
          </div>
        );

      case 'battle':
        return null;

      case 'victory':
        return (
          <div style={{ padding: '20px', textAlign: 'center' }}>
            <button onClick={() => window.location.reload()} className="btn">
              New Adventure
            </button>
          </div>
        );

      case 'defeat':
        return (
          <div style={{ padding: '20px', textAlign: 'center' }}>
            <button onClick={() => window.location.reload()} className="btn">
              Retry
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="game-viewport">
      <div className={`scrolling-bg ${gameState === 'battle' || gameState === 'victory' || gameState === 'defeat' ? 'boss-scene' : ''}`}></div>

      {gameState === 'battle' && (
        <div id="team-hud" style={{ position: 'absolute', top: '15px', left: '15px', maxHeight: '350px', zIndex: 15 }}>
          <div style={{ color: '#a020f0', marginBottom: '12px', fontSize: '12px', fontWeight: 'bold' }}>
            TEAM STATUS
          </div>
          <div style={{ color: '#a020f0', marginBottom: '8px', fontSize: '11px' }}>
            {state.mainCharacter?.name}:
            <div className="hp-track">
              <div className="hp-fill" style={{ width: `${(state.mainCharacter?.hp / state.mainCharacter?.maxHP) * 100}%` }}></div>
            </div>
          </div>
          {state.team.map((member, idx) => (
            <div key={idx} style={{ color: '#a020f0', marginBottom: '8px', fontSize: '11px' }}>
              {member.name}:
              <div className="hp-track">
                <div className="hp-fill" style={{ width: `${(member.hp / member.maxHP) * 100}%` }}></div>
              </div>
            </div>
          ))}
          <div style={{ color: '#d81b60', marginTop: '14px', fontSize: '11px', fontWeight: 'bold' }}>
            DREADLORD:
            <div className="hp-track">
              <div className="hp-fill" style={{ width: `${state.bossHP}%` }}></div>
            </div>
          </div>
        </div>
      )}

      {showSlider && (
        <div className="undertale-box">
          <div className="target-zone"></div>
          <div className="slider" style={{ left: `${sliderPos}px` }}></div>
        </div>
      )}

      <div className="overlay">
        <div id="dialog-text">{dialogText}</div>
        {gameState === 'battle' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {showSlider ? (
              <button onClick={resolveSlash} className="btn event-btn">
                SLASH NOW!
              </button>
            ) : showEventBar ? (
              getWeaponActions()
            ) : null}
          </div>
        ) : (
          getScreenContent()
        )}
      </div>
    </div>
  );
}
