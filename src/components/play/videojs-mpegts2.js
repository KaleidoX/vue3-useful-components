import videojs from 'video.js'
import mpegtsjs from 'mpegts.js'

/**
 *
 * @param source
 * @param tech
 * @constructor
 */
function Html5mpegts(source, tech) {
  var options = tech.options_
  var el = tech.el()
  var duration = null

  const mediaDataSource = options.mediaDataSource || {}

  mediaDataSource.type = mediaDataSource.type === undefined ? 'flv' : mediaDataSource.type
  mediaDataSource.url = source.src

  var player = mpegtsjs.createPlayer(mediaDataSource, options.mpegtsConfig)

  /**
   * creates an error handler function
   * @returns {Function}
   */
  function errorHandlerFactory() {
    var _recoverDecodingErrorDate = null
    var _recoverAudioCodecErrorDate = null

    return function () {
      var now = Date.now()

      if (!_recoverDecodingErrorDate || now - _recoverDecodingErrorDate > 2000) {
        _recoverDecodingErrorDate = now
        //hls.recoverMediaError();
      } else if (!_recoverAudioCodecErrorDate || now - _recoverAudioCodecErrorDate > 2000) {
        _recoverAudioCodecErrorDate = now
        //hls.swapAudioCodec();
        //hls.recoverMediaError();
      } else {
        console.error('Error loading media: File could not be played')
      }
    }
  }

  // create separate error handlers for hlsjs and the video tag
  var videoTagErrorHandler = errorHandlerFactory()

  // listen to error events coming from the video tag
  el.addEventListener('error', function (e) {
    var mediaError = e.currentTarget.error

    if (mediaError && mediaError.code === mediaError.MEDIA_ERR_DECODE) {
      videoTagErrorHandler()
    } else {
      console.error('Error loading media: File could not be played')
    }
  })

  /**
   *
   */
  this.dispose = function () {
    player.destroy()
  }

  /**
   * returns the duration of the stream, or Infinity if live video
   * @returns {Infinity|number}
   */
  this.duration = function () {
    return duration || el.duration || 0
  }

  // update live status on meida info load
  player.on(mpegtsjs.Events.MEDIA_INFO, function (data) {
    duration = data.duration || Infinity
  })

  // try to recover when live and then loading has started
  player.on(mpegtsjs.Events.LOADING_COMPLETE, function () {
    // Only if live
    if (duration === Infinity) {
      player.unload()

      setTimeout(function () {
        player.load()
        player.play()
      }, 500)
    }
  })

  Object.keys(mpegtsjs.Events).forEach(function (key) {
    var eventName = mpegtsjs.Events[key]
    player.on(eventName, function (event, data) {
      tech.trigger(eventName, data)
    })
  })

  // attach mpegtsjs to videotag
  player.attachMediaElement(el)
  player.load()
}

var FlvSourceHandler = {
  canHandleSource: function (source) {
    var flvTypeRE = /^video\/flv$/i
    var flvExtRE = /\.flv/i
    var flvProtoRE = /^((ws:\/\/)|(http:\/\/))/i

    if (flvTypeRE.test(source.type)) {
      return 'probably'
    } else if (flvExtRE.test(source.src) || flvProtoRE.test(source.src)) {
      return 'maybe'
    } else {
      return ''
    }
  },
  handleSource: function (source, tech) {
    return new Html5mpegts(source, tech)
  },
  canPlayType: function (type) {
    var flvTypeRE = /^video\/flv$/i
    if (flvTypeRE.test(type)) {
      return 'probably'
    }

    return ''
  }
}

// only attach this source handler is its supported
if (mpegtsjs.isSupported()) {
  videojs.getTech('Html5').registerSourceHandler(FlvSourceHandler, 0)
}
