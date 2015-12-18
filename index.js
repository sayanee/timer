/* global FastClick, screenfull */
(function () {
  ;console.log('%c happy timing ;-)', 'background: #f15b47; color: #fff')

  var play = false
  var intervalID
  var minElement = document.getElementById('minutes')
  var secElement = document.getElementById('seconds')
  var infoElement = document.getElementById('info')
  var progressElement = document.getElementById('progress')
  var minValue = sanitize(minElement.innerHTML)
  var secValue = sanitize(secElement.innerHTML)
  var minSecValues = [ 0, 5, 0, 0 ]
  var minSecValueCount = 0
  var totalSeconds = minValue * 60 + secValue
  var currentSeconds = 0
  var singleTap = false
  var doubleTap = false
  var configAscii = {
    '48': '0',
    '49': 1,
    '50': 2,
    '51': 3,
    '52': 4,
    '53': 5,
    '54': 6,
    '55': 7,
    '56': 8,
    '57': 9
  }

  minElement.addEventListener('blur', setTimer)
  secElement.addEventListener('blur', setTimer)

  function setMinSecValues (pressedValue) {
    if (!pressedValue) return
    if (play) return

    minSecValues[ 0 ] = minSecValues[ 1 ]
    minSecValues[ 1 ] = minSecValues[ 2 ]
    minSecValues[ 2 ] = minSecValues[ 3 ]
    minSecValues[ 3 ] = pressedValue

    minElement.innerHTML = minSecValues[ 0 ] + '' + minSecValues[ 1 ]
    secElement.innerHTML = minSecValues[ 2 ] + '' + minSecValues[ 3 ]
    setTimer()
    setColors(minSecValueCount)
    minSecValueCount = (minSecValueCount + 1) % 4
  }

  function setColors (count) {
    return count < 2 ? minElement.className = 'clock mute' : minElement.className = 'clock info'
  }

  function setTimer () {
    minValue = sanitize(minElement.innerHTML)
    secValue = sanitize(secElement.innerHTML)
    totalSeconds = secValue + 60 * minValue
    currentSeconds = 0
  }

  function sanitize (input) {
    return Math.abs(parseInt(input, 10))
  }

  function make2Digits (input) {
    return ('0' + input).slice(-2)
  }

  function startCountdown (min, sec) {
    intervalID = setInterval(function () {
      if (--sec < 0) {
        sec += 60

        if (--min < 0) {
          endCountdown()
          clearInterval(intervalID)
          return
        }
      }
      minElement.innerHTML = ('0' + min).slice(-2)
      secElement.innerHTML = ('0' + sec).slice(-2)

      currentSeconds++
      progressElement.value = Math.ceil(currentSeconds / totalSeconds * 100)
    }, 1000)
  }

  function endCountdown () {
    infoElement.style.display = 'block'
    progressElement.style.display = 'none'
  }

  function togglePausePlay () {
    if (play) {
      play = false
      clearInterval(intervalID)
      if (screenfull.enabled) screenfull.exit()
    } else {
      minElement.innerHTML = make2Digits(sanitize(minElement.innerHTML))
      secElement.innerHTML = make2Digits(sanitize(secElement.innerHTML))
      startCountdown(minElement.innerHTML, secElement.innerHTML)
      play = true
      infoElement.style.display = 'none'
      progressElement.style.display = 'block'
      if (screenfull.enabled) screenfull.request()
    }
  }

  function resetTimer () {
    clearInterval(intervalID)
    minElement.innerHTML = make2Digits(minValue)
    secElement.innerHTML = make2Digits(secValue)
    infoElement.style.display = 'block'
    progressElement.style.display = 'none'
    progressElement.value = 0
    currentSeconds = 0
  }

  function is_touch_device () {
    try {
      document.createEvent('TouchEvent')
      return true
    } catch (e) {
      return false
    }
  }

  function setIntructions () {
    if (is_touch_device()) {
      var className = 'hidden'
      var nilClass = ''

      document.getElementById('info-space').className = className
      document.getElementById('info-esc').className = className
      document.getElementById('info-tap').className = nilClass
      document.getElementById('info-2tap').className = nilClass
    }
  }

  setMinSecValues()
  setIntructions()

  if (is_touch_device()) {
    document.getElementById('edit').innerHTML = '<input type="number" placeholder="0500" class="input"> edit time'

    if ('addEventListener' in document) {
      document.addEventListener('DOMContentLoaded', function () {
        FastClick.attach(document.body)
      }, false)
    }
  }

  window.addEventListener('keydown', function (e) {
    if (e.keyCode === 32) { // ASCII 32 is space
      e.preventDefault()
      return togglePausePlay()
    } else if (e.keyCode === 27 || e.keyCode === 13) { // ASCII 27, 13 is escape, enter
      return resetTimer()
    } else if (e.keyCode > 47 && e.keyCode < 58) { // ASCII value is a number
      return setMinSecValues(configAscii[ e.keyCode ])
    }
  })

  window.addEventListener('click', function (e) {
    if (e.toElement && e.toElement.tagName !== 'INPUT') {
      return togglePausePlay()
    }

    if (e.target && e.target.tagName !== 'INPUT') {
      return togglePausePlay()
    }
  })

  window.addEventListener('touchend', function (e) {
    if (e.srcElement.tagName !== 'INPUT') {
      if (!singleTap) {
        singleTap = true
        setTimeout(function () {
          singleTap = false
          if (doubleTap) resetTimer()
          else togglePausePlay()
          doubleTap = false
        }, 400)
      } else {
        doubleTap = true
      }
    }
  })
})()
