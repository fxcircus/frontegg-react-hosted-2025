const { DataTypes } = require('sequelize');
const sequelize = require('./database');

const Pokemon = sequelize.define('Pokemon', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'user_id'
  },
  pokemonName: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'pokemon_name'
  },
  pokemonType: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'pokemon_type'
  },
  rarity: {
    type: DataTypes.ENUM('common', 'uncommon', 'rare', 'legendary'),
    allowNull: false,
    defaultValue: 'common'
  },
  level: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  nickname: {
    type: DataTypes.STRING,
    allowNull: true
  },
  emoji: {
    type: DataTypes.STRING,
    allowNull: false
  },
  caughtAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'caught_at'
  }
}, {
  tableName: 'pokemon',
  timestamps: true,
  underscored: true
});

// Available Pokemon data
Pokemon.AVAILABLE_POKEMON = [
  // Common (60% chance)
  { name: 'Pidgey', type: 'flying', emoji: '🦅', rarity: 'common' },
  { name: 'Rattata', type: 'normal', emoji: '🐀', rarity: 'common' },
  { name: 'Caterpie', type: 'bug', emoji: '🐛', rarity: 'common' },
  { name: 'Weedle', type: 'bug', emoji: '🐝', rarity: 'common' },
  { name: 'Magikarp', type: 'water', emoji: '🐟', rarity: 'common' },
  { name: 'Zubat', type: 'flying', emoji: '🦇', rarity: 'common' },
  
  // Uncommon (30% chance)
  { name: 'Pikachu', type: 'electric', emoji: '⚡', rarity: 'uncommon' },
  { name: 'Bulbasaur', type: 'grass', emoji: '🌱', rarity: 'uncommon' },
  { name: 'Charmander', type: 'fire', emoji: '🔥', rarity: 'uncommon' },
  { name: 'Squirtle', type: 'water', emoji: '💧', rarity: 'uncommon' },
  { name: 'Eevee', type: 'normal', emoji: '🦊', rarity: 'uncommon' },
  
  // Rare (9% chance)
  { name: 'Snorlax', type: 'normal', emoji: '😴', rarity: 'rare' },
  { name: 'Dragonite', type: 'dragon', emoji: '🐲', rarity: 'rare' },
  { name: 'Lapras', type: 'water', emoji: '🦕', rarity: 'rare' },
  
  // Legendary (1% chance)
  { name: 'Mewtwo', type: 'psychic', emoji: '🧬', rarity: 'legendary' },
  { name: 'Mew', type: 'psychic', emoji: '✨', rarity: 'legendary' }
];

// Get a random Pokemon based on rarity
Pokemon.getRandomPokemon = function() {
  const rand = Math.random() * 100;
  let rarityFilter;
  
  if (rand < 1) {
    rarityFilter = 'legendary';
  } else if (rand < 10) {
    rarityFilter = 'rare';
  } else if (rand < 40) {
    rarityFilter = 'uncommon';
  } else {
    rarityFilter = 'common';
  }
  
  const filtered = Pokemon.AVAILABLE_POKEMON.filter(p => p.rarity === rarityFilter);
  return filtered[Math.floor(Math.random() * filtered.length)];
};

// Instance methods
Pokemon.prototype.toJSON = function() {
  const values = this.get();
  return {
    id: values.id,
    name: values.pokemonName,
    type: values.pokemonType,
    rarity: values.rarity,
    level: values.level,
    nickname: values.nickname,
    emoji: values.emoji,
    caughtAt: values.caughtAt
  };
};

module.exports = Pokemon;