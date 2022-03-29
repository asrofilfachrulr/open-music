const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');

class UserAlbumLikesService {
  constructor(cacheService) {
    this._cacheService = cacheService;
    this._pool = new Pool();
  }

  async addUserAlbumLike(userId, albumId) {
    const id = `likeg@${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO user_album_like VALUES($1, $2, $3) RETURNING id',
      values: [id, userId, albumId],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError(`Gagal merekam like ${userId} pada album ${albumId}`);
    }

    await this._cacheService.delete(`likes:${albumId}`);
  }

  async removeUserAlbumLike(userId, albumId) {
    const query = {
      text: 'DELETE FROM user_album_like WHERE user_id = $1 AND album_id = $2 RETURNING id',
      values: [userId, albumId],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError(`Gagal menghapus like ${userId} pada album ${albumId}`);
    }
    await this._cacheService.delete(`likes:${albumId}`);
  }

  async getUserAlbumLikeByIds(userId, albumId) {
    const query = {
      text: 'SELECT user_id FROM user_album_like WHERE user_id = $1 AND album_id = $2',
      values: [userId, albumId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      return false;
    }
    return true;
  }

  async getCountUserAlbumLike(albumId) {
    try {
      const count = await this._cacheService.get(`likes:${albumId}`);
      return {
        count,
        source: 'cache',
      };
    } catch (error) {
      const queryPlaylist = {
        text: 'SELECT COUNT(*) FROM user_album_like WHERE album_id = $1',
        values: [albumId],
      };

      const result = await this._pool.query(queryPlaylist);

      await this._cacheService.set(`likes:${albumId}`, result.rows[0].count);

      return {
        count: result.rows[0].count,
        source: 'db',
      };
    }
  }
}

module.exports = UserAlbumLikesService;
