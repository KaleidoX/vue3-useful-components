// edit from https://github.com/mister-ben/videojs-flvjs/blob/master/src/plugin.js

/**
 * @file plugin.js
 */

import videojs from 'video.js'
import mpegtsjs from 'mpegts.js'

const Html5 = videojs.getTech('Html5')
const mergeOptions = videojs.mergeOptions
const defaults = {
  mediaDataSource: {},
  config: {}
}

class MpegTsJs extends Html5 {
  /**
   * Create an instance of this Tech.
   *
   * @param {Object} [options]
   *        The key/value store of player options.
   *
   * @param {Component~ReadyCallback} ready
   *        Callback function to call when the `MpegTsJs` Tech is ready.
   */
  constructor(options, ready) {
    options = mergeOptions(defaults, options)
    super(options, ready)
  }

  /**
   * A getter/setter for the `MpegTsJs` Tech's source object.
   *
   * @param {Tech~SourceObject} [src]
   *        The source object you want to set on the `MpegTsJs` techs.
   *
   * @return {Tech~SourceObject|undefined}
   *         - The current source object when a source is not passed in.
   *         - undefined when setting
   */
  setSrc(src) {
    if (this.mpegtsPlayer) {
      // Is this necessary to change source?
      this.mpegtsPlayer.detachMediaElement()
      this.mpegtsPlayer.destroy()
    }

    const mediaDataSource = this.options_.mediaDataSource
    const config = this.options_.config

    mediaDataSource.type = mediaDataSource.type === undefined ? 'mse' : mediaDataSource.type
    mediaDataSource.url = src
    this.mpegtsPlayer = mpegtsjs.createPlayer(mediaDataSource, config)
    this.mpegtsPlayer.attachMediaElement(this.el_)
    this.mpegtsPlayer.load()
  }

  /**
   * Dispose of mpegtsjs.
   */
  dispose() {
    if (this.mpegtsPlayer) {
      this.mpegtsPlayer.detachMediaElement()
      this.mpegtsPlayer.destroy()
    }
    super.dispose()
  }
  /**
   * Check if the MpegTsJs tech is currently supported.
   *
   * @return {boolean}
   *          - True if the MpegTsJs tech is supported.
   *          - False otherwise.
   */
  static isSupported() {
    return mpegtsjs && mpegtsjs.isSupported()
  }
  /**
   * MpegTsJs supported mime types.
   *
   * @constant {Object}
   */
  static formats = {
    // https://datatracker.ietf.org/doc/html/rfc3555#section-4.2.9
    mse: 'mse',
    mpegts: 'mpegts',
    m2ts: 'm2ts',
    flv: 'flv'
  }
  /**
   * Check if the tech can support the given type
   *
   * @param {{src: string, type: string}} source
   *        The mimetype to check
   * @return {string} 'probably', 'maybe', or '' (empty string)
   */
  static canPlayType(source) {
    const flvTypeRE = /^video\/flv$/i
    const flvExtRE = /\.flv/i
    const flvProtoRE = /^((ws:\/\/)|(http:\/\/))/i
    if (source.type in this.formats) {
      return 'maybe'
    }
    if (flvTypeRE.test(source.type)) {
      return 'probably'
    } else if (flvExtRE.test(source.src) || flvProtoRE.test(source.src)) {
      return 'maybe'
    } else {
      return ''
    }
  }

  /**
   * Check if the tech can support the given source
   * @param {Object} source
   *        The source object
   * @param {Object} options
   *        The options passed to the tech
   * @return {string} 'probably', 'maybe', or '' (empty string)
   */
  static canPlaySource(source, options) {
    return this.canPlayType(source, options)
  }

  // Include the version number.
  static VERSION = '0.0.1'
}

if (MpegTsJs.isSupported()) {
  videojs.registerTech('MpegTsJs', MpegTsJs)
}

export default MpegTsJs
