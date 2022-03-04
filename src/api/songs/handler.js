const ClientError = require('../../exceptions/ClientError');
const InternalServerError = require('../../exceptions/InternalServerError');

class SongsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    this.postSongHandler = this.postSongHandler.bind(this);
    this.getSongsHandler = this.getSongsHandler.bind(this);
    this.getSongByIdHandler = this.getSongByIdHandler.bind(this);
    this.putSongByIdHandler = this.putSongByIdHandler.bind(this);
    this.deleteSongByIdHandler = this.deleteSongByIdHandler.bind(this);
  }

  async postSongHandler({payload}, h) {
    try {
      this._validator.validateSongPayload(payload);

      const songId = await this._service.addSong(payload);

      const response = h.response({
        status: 'success',
        data: {
          songId,
        },
      });
      response.code(201);
      return response;
    } catch (error) {
      if (error instanceof ClientError) {
        return error;
      }
      return new InternalServerError('Maaf, terjadi kegagalan pada server kami');
    }
  }

  async getSongsHandler(request, h) {
    try {
      const params = request.query;
      const songs = await this._service.getSongs(params);
      return {
        status: 'success',
        data: {
          songs,
        },
      };
    } catch (error) {
      if (error instanceof ClientError) {
        return error;
      }
      return new InternalServerError('Maaf, terjadi kegagalan pada server kami');
    }
  }

  async getSongByIdHandler(request, h) {
    try {
      const { id } = request.params;
      const song = await this._service.getSongById(id);

      return {
        status: 'success',
        data: {
          song,
        },
      };
    } catch (error) {
      if (error instanceof ClientError) {
        return error;
      }
      return new InternalServerError('Maaf, terjadi kegagalan pada server kami');
    }
  }

  async putSongByIdHandler(request, h) {
    try {
      this._validator.validateSongPayload(request.payload);
      const { id } = request.params;

      await this._service.updateSongById(id, request.payload);

      return {
        status: 'success',
        message: `Lagu ${id} berhasil diperbarui`,
      };
    } catch (error) {
      if (error instanceof ClientError) {
        return error;
      }
      return new InternalServerError('Maaf, terjadi kegagalan pada server kami');
    }
  }

  async deleteSongByIdHandler(request, h) {
    try {
      const { id } = request.params;

      await this._service.removeSongById(id);

      return {
        status: 'success',
        message: `Lagu ${id} berhasil dihapus`,
      };
    } catch (error) {
      if (error instanceof ClientError) {
        return error;
      }
      return new InternalServerError('Maaf, terjadi kegagalan pada server kami');
    }
  }
}

module.exports = SongsHandler;
