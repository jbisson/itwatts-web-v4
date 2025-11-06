function decodeBase64(str) {
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='
  var result = ''
  var i = 0
  do {
    var b1 = characters.indexOf(str.charAt(i++))
    var b2 = characters.indexOf(str.charAt(i++))
    var b3 = characters.indexOf(str.charAt(i++))
    var b4 = characters.indexOf(str.charAt(i++))
    var a = ((b1 & 0x3F) << 2) | ((b2 >> 4) & 0x3)
    var b = ((b2 & 0xF) << 4) | ((b3 >> 2) & 0xF)
    var c = ((b3 & 0x3) << 6) | (b4 & 0x3F)
    result += String.fromCharCode(a) + (b ? String.fromCharCode(b) : '') + (c ? String.fromCharCode(c) : '')
  } while (i < str.length)
  return result
}

function rawTimeSecsToFriendlyTime(secs) {
  if (!secs) {
    return '';
  }

  let negative = '';
  if (secs < 0) {
    secs = Math.abs(secs);
    negative = '-';
  }
  const hours = Math.floor(secs / 3600);
  const minutes = Math.floor((secs - (hours * 3600)) / 60);
  const seconds = (Math.round(secs) - (hours * 3600) - (minutes * 60)).toString().padStart(2, '0');

  if (hours)  {
    return `${negative}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds}`;
  } else if (minutes) {
    return `${negative}${minutes}:${seconds}`;
  } else {
    return `${negative}${seconds}`;
  }
}

export { decodeBase64, rawTimeSecsToFriendlyTime }
