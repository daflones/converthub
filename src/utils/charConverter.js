export const transformations = {
  uppercase: { label: 'MAIÚSCULAS', fn: (t) => t.toUpperCase() },
  lowercase: { label: 'minúsculas', fn: (t) => t.toLowerCase() },
  titlecase: {
    label: 'Title Case',
    fn: (t) => t.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()),
  },
  camelcase: {
    label: 'camelCase',
    fn: (t) => {
      const words = t.split(/[\s_\-]+/).filter(Boolean)
      return words.map((w, i) => i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('')
    },
  },
  snakecase: {
    label: 'snake_case',
    fn: (t) => t.replace(/[\s\-]+/g, '_').replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase(),
  },
  kebabcase: {
    label: 'kebab-case',
    fn: (t) => t.replace(/[\s_]+/g, '-').replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase(),
  },
  screamingsnake: {
    label: 'SCREAMING_SNAKE',
    fn: (t) => t.replace(/[\s\-]+/g, '_').replace(/([a-z])([A-Z])/g, '$1_$2').toUpperCase(),
  },
  removeaccents: {
    label: 'Remover Acentos',
    fn: (t) => t.normalize('NFD').replace(/[\u0300-\u036f]/g, ''),
  },
  removeextraspaces: {
    label: 'Remover Espaços Extras',
    fn: (t) => t.replace(/\s+/g, ' ').trim(),
  },
  removelinebreaks: {
    label: 'Remover Quebras de Linha',
    fn: (t) => t.replace(/[\r\n]+/g, ' '),
  },
  texttoascii: {
    label: 'Texto → ASCII',
    fn: (t) => t.split('').map((c) => c.charCodeAt(0)).join(' '),
  },
  asciitotext: {
    label: 'ASCII → Texto',
    fn: (t) => t.split(/\s+/).filter(Boolean).map((n) => String.fromCharCode(parseInt(n))).join(''),
  },
  texttobinary: {
    label: 'Texto → Binário',
    fn: (t) => t.split('').map((c) => c.charCodeAt(0).toString(2).padStart(8, '0')).join(' '),
  },
  binarytotext: {
    label: 'Binário → Texto',
    fn: (t) => t.split(/\s+/).filter(Boolean).map((b) => String.fromCharCode(parseInt(b, 2))).join(''),
  },
  texttohex: {
    label: 'Texto → Hexadecimal',
    fn: (t) => t.split('').map((c) => c.charCodeAt(0).toString(16).padStart(2, '0')).join(' '),
  },
  hextotext: {
    label: 'Hexadecimal → Texto',
    fn: (t) => t.split(/\s+/).filter(Boolean).map((h) => String.fromCharCode(parseInt(h, 16))).join(''),
  },
  texttobase64: {
    label: 'Texto → Base64',
    fn: (t) => btoa(unescape(encodeURIComponent(t))),
  },
  base64totext: {
    label: 'Base64 → Texto',
    fn: (t) => {
      try { return decodeURIComponent(escape(atob(t))) } catch { return 'Erro: Base64 inválido' }
    },
  },
  texttomorse: {
    label: 'Texto → Morse',
    fn: (t) => {
      const morseMap = {
        A: '.-', B: '-...', C: '-.-.', D: '-..', E: '.', F: '..-.', G: '--.', H: '....',
        I: '..', J: '.---', K: '-.-', L: '.-..', M: '--', N: '-.', O: '---', P: '.--.',
        Q: '--.-', R: '.-.', S: '...', T: '-', U: '..-', V: '...-', W: '.--', X: '-..-',
        Y: '-.--', Z: '--..', '0': '-----', '1': '.----', '2': '..---', '3': '...--',
        '4': '....-', '5': '.....', '6': '-....', '7': '--...', '8': '---..', '9': '----.',
        ' ': '/', '.': '.-.-.-', ',': '--..--', '?': '..--..', '!': '-.-.--',
      }
      return t.toUpperCase().split('').map((c) => morseMap[c] || c).join(' ')
    },
  },
  morsetotext: {
    label: 'Morse → Texto',
    fn: (t) => {
      const morseMap = {
        '.-': 'A', '-...': 'B', '-.-.': 'C', '-..': 'D', '.': 'E', '..-.': 'F', '--.': 'G',
        '....': 'H', '..': 'I', '.---': 'J', '-.-': 'K', '.-..': 'L', '--': 'M', '-.': 'N',
        '---': 'O', '.--.': 'P', '--.-': 'Q', '.-.': 'R', '...': 'S', '-': 'T', '..-': 'U',
        '...-': 'V', '.--': 'W', '-..-': 'X', '-.--': 'Y', '--..': 'Z', '-----': '0',
        '.----': '1', '..---': '2', '...--': '3', '....-': '4', '.....': '5', '-....': '6',
        '--...': '7', '---..': '8', '----.': '9', '/': ' ', '.-.-.-': '.', '--..--': ',',
        '..--..': '?', '-.-.--': '!',
      }
      return t.split(' ').map((c) => morseMap[c] || c).join('')
    },
  },
  rot13: {
    label: 'ROT13',
    fn: (t) => t.replace(/[a-zA-Z]/g, (c) => {
      const base = c <= 'Z' ? 65 : 97
      return String.fromCharCode(((c.charCodeAt(0) - base + 13) % 26) + base)
    }),
  },
}

export function countStats(text) {
  return {
    chars: text.length,
    words: text.trim() ? text.trim().split(/\s+/).length : 0,
    lines: text ? text.split(/\r?\n/).length : 0,
    bytes: new Blob([text]).size,
  }
}
