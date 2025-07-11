const Pokemon = require('../models/pokemon');
const { Op } = require('sequelize');

class PokemonController {
  // Catch a random Pokemon
  async catch(req, res) {
    try {
      const userId = req.frontegg.user.sub;
      
      // Get a random Pokemon based on rarity
      const randomPokemon = Pokemon.getRandomPokemon();
      
      if (!randomPokemon) {
        return res.status(500).json({
          error: 'Failed to generate Pokemon',
          message: 'No Pokemon available'
        });
      }

      // Create the Pokemon for the user
      const pokemon = await Pokemon.create({
        userId,
        pokemonName: randomPokemon.name,
        pokemonType: randomPokemon.type,
        rarity: randomPokemon.rarity,
        emoji: randomPokemon.emoji,
        level: 1
      });

      // Return success with the caught Pokemon
      res.json({
        success: true,
        message: `You caught a ${randomPokemon.rarity} ${randomPokemon.name}!`,
        pokemon: pokemon.toJSON(),
        celebratory: randomPokemon.rarity === 'legendary' ? '🎉🎊 LEGENDARY! 🎊🎉' : 
                     randomPokemon.rarity === 'rare' ? '✨ Rare catch! ✨' : null
      });
    } catch (error) {
      console.error('Error catching Pokemon:', error);
      res.status(500).json({
        error: 'Failed to catch Pokemon',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
      });
    }
  }

  // Get user's Pokemon collection
  async getMyCollection(req, res) {
    try {
      const userId = req.frontegg.user.sub;

      // Get all Pokemon for this user
      const pokemon = await Pokemon.findAll({
        where: { userId },
        order: [
          ['rarity', 'DESC'], // Legendary first
          ['caughtAt', 'DESC'] // Newest first within same rarity
        ]
      });

      // Calculate collection stats
      const stats = {
        total: pokemon.length,
        byRarity: {
          legendary: pokemon.filter(p => p.rarity === 'legendary').length,
          rare: pokemon.filter(p => p.rarity === 'rare').length,
          uncommon: pokemon.filter(p => p.rarity === 'uncommon').length,
          common: pokemon.filter(p => p.rarity === 'common').length
        },
        uniqueTypes: [...new Set(pokemon.map(p => p.pokemonType))].length
      };

      res.json({
        success: true,
        pokemon: pokemon.map(p => p.toJSON()),
        stats
      });
    } catch (error) {
      console.error('Error getting Pokemon collection:', error);
      res.status(500).json({
        error: 'Failed to get Pokemon collection',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
      });
    }
  }

  // Trade Pokemon with another user
  async trade(req, res) {
    try {
      const userId = req.frontegg.user.sub;
      const targetUserId = req.params.userId;
      
      // Can't trade with yourself
      if (userId === targetUserId) {
        return res.status(400).json({
          error: 'Invalid trade',
          message: 'You cannot trade with yourself'
        });
      }

      // Get random Pokemon from each user
      const [myPokemon, theirPokemon] = await Promise.all([
        Pokemon.findOne({
          where: { userId },
          order: Pokemon.sequelize.random()
        }),
        Pokemon.findOne({
          where: { userId: targetUserId },
          order: Pokemon.sequelize.random()
        })
      ]);

      // Check if both users have Pokemon
      if (!myPokemon) {
        return res.status(400).json({
          error: 'No Pokemon to trade',
          message: 'You need to catch some Pokemon first!'
        });
      }

      if (!theirPokemon) {
        return res.status(400).json({
          error: 'Trade failed',
          message: 'The other trainer has no Pokemon to trade'
        });
      }

      // Store original Pokemon info
      const myPokemonInfo = myPokemon.toJSON();
      const theirPokemonInfo = theirPokemon.toJSON();

      // Perform the trade (swap userIds)
      await Promise.all([
        myPokemon.update({ userId: targetUserId }),
        theirPokemon.update({ userId })
      ]);

      res.json({
        success: true,
        message: 'Trade successful!',
        trade: {
          gave: {
            name: myPokemonInfo.name,
            emoji: myPokemonInfo.emoji,
            rarity: myPokemonInfo.rarity
          },
          received: {
            name: theirPokemonInfo.name,
            emoji: theirPokemonInfo.emoji,
            rarity: theirPokemonInfo.rarity
          }
        },
        celebratory: theirPokemonInfo.rarity === 'legendary' ? '🎉 You received a LEGENDARY Pokemon! 🎉' :
                     theirPokemonInfo.rarity === 'rare' ? '✨ You received a rare Pokemon! ✨' : null
      });
    } catch (error) {
      console.error('Error trading Pokemon:', error);
      res.status(500).json({
        error: 'Failed to trade Pokemon',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
      });
    }
  }

  // Get leaderboard (bonus endpoint)
  async getLeaderboard(req, res) {
    try {
      const leaderboard = await Pokemon.findAll({
        attributes: [
          'userId',
          [Pokemon.sequelize.fn('COUNT', Pokemon.sequelize.col('id')), 'totalPokemon'],
          [Pokemon.sequelize.fn('COUNT', Pokemon.sequelize.fn('DISTINCT', Pokemon.sequelize.col('pokemon_name'))), 'uniquePokemon']
        ],
        group: ['userId'],
        order: [[Pokemon.sequelize.fn('COUNT', Pokemon.sequelize.col('id')), 'DESC']],
        limit: 10
      });

      res.json({
        success: true,
        leaderboard: leaderboard.map((entry, index) => ({
          rank: index + 1,
          trainerId: entry.userId.substring(0, 8) + '...', // Privacy
          totalPokemon: parseInt(entry.get('totalPokemon')),
          uniquePokemon: parseInt(entry.get('uniquePokemon'))
        }))
      });
    } catch (error) {
      console.error('Error getting leaderboard:', error);
      res.status(500).json({
        error: 'Failed to get leaderboard',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
      });
    }
  }
}

module.exports = new PokemonController();