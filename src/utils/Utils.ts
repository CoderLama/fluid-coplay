/**
 * Convert amount of seconds to duration string in format of HH:MM:SS
 * @param amountOfSeconds
 * @returns {string}
 */
 export const toHHMMSS = ( amountOfSeconds ) => {
  const sec_num = parseInt ( amountOfSeconds, 10 )
  let hours = Math.floor ( sec_num / 3600 )
  let minutes = Math.floor ( (sec_num - (hours * 3600)) / 60 )
  let seconds = sec_num - (hours * 3600) - (minutes * 60)

  let sHours = hours.toString();
  let sMinutes: string = minutes.toString();
  let sSeconds: string = seconds.toString(); 

  if ( hours < 10 ) {
    sHours = "0" + hours
  }
  if ( minutes < 10 ) {
    sMinutes = "0" + minutes
  }
  if ( seconds < 10 ) {
    sSeconds = "0" + seconds
  }

  return sHours + ':' + sMinutes + ':' + sSeconds
}

/**
 * Maximize an element on screen
 * @param elem
 */
 export const requestFullScreenOnElement = ( elem ) => {
  if ( elem.requestFullscreen ) {
    elem.requestFullscreen ();
  } else if ( elem.msRequestFullscreen ) {
    elem.msRequestFullscreen ();
  } else if ( elem.mozRequestFullScreen ) {
    elem.mozRequestFullScreen ();
  } else if ( elem.webkitRequestFullscreen ) {
    elem.webkitRequestFullscreen ();
  }
}

/**
 * Minimize all maximized nodes on the page
 */
 export const exitFullScreen = () => {
  if (document.exitFullscreen) {
    document.exitFullscreen();
  } 
  // else if (document.msExitFullscreen) {
  //   document.msExitFullscreen();
  // } else if (document.mozCancelFullScreen) {
  //   document.mozCancelFullScreen();
  // } else if (document.webkitExitFullscreen) {
  //   document.webkitExitFullscreen();
  // }
}

/**
 * Get the amounts of seconds in a video corresponding to the x position of a mouseEvent in a DOM element
 * effectively making it possible to turn any DOM element into a video-seekbar
 * ( I.E. 342px X position in an element with a width of 1000px
 * corresponds to 171 seconds into a video with a videoDuration of 500 seconds )
 * @param clickEvent
 * @param videoDuration
 * @returns {*|number}
 */
export const getAmountOfSecondsAtXPos = ( clickEvent, videoDuration ) => {
  const parentWidth = clickEvent.target.getBoundingClientRect ().width
  const relativeMousePosition = {
    relativeX: clickEvent.clientX - clickEvent.target.getBoundingClientRect ().left,
    relativeY: clickEvent.clientY - clickEvent.target.getBoundingClientRect ().top
  }

  return pixelsToSeconds ( relativeMousePosition.relativeX, parentWidth, videoDuration )
}

/**
 * Returns the number of seconds corresponding to the x-position in a video seek-bar element
 * @param xPos
 * @param elementWidth
 * @param videoDuration
 * @returns {number}
 */
export const pixelsToSeconds = ( xPos, elementWidth, videoDuration ) => {
  return ( xPos / elementWidth ) * videoDuration
}

/**
 * Returns the amount of pixels in a seekbar element corresponding to a number of seconds in a video
 * @param seconds
 * @param elementWidth
 * @param videoDuration
 * @returns {number}
 */
export const secondsToPixels = ( seconds, elementWidth, videoDuration ) => {
  return ( seconds / videoDuration ) * elementWidth
}