const hasBlobConstructor =
  typeof Blob !== 'undefined' &&
  (function () {
    try {
      return Boolean(new Blob())
    } catch (e) {
      return false
    }
  })()

const hasArrayBufferViewSupport =
  hasBlobConstructor &&
  typeof Uint8Array !== 'undefined' &&
  (function () {
    try {
      return new Blob([new Uint8Array(100)]).size === 100
    } catch (e) {
      return false
    }
  })()

const hasToBlobSupport =
  typeof HTMLCanvasElement !== 'undefined'
    ? HTMLCanvasElement.prototype.toBlob
    : false

const hasBlobSupport =
  hasToBlobSupport ||
  (typeof Uint8Array !== 'undefined' &&
    typeof ArrayBuffer !== 'undefined' &&
    typeof atob !== 'undefined')

const hasReaderSupport =
  typeof FileReader !== 'undefined' || typeof URL !== 'undefined'

const supportsResize = () =>
  typeof HTMLCanvasElement !== 'undefined' && hasBlobSupport && hasReaderSupport

const toBlob = (canvas, type, name) => {
  let dataURI = canvas.toDataURL(type)
  let dataURIParts = dataURI.split(',')
  let byteString
  if (dataURIParts[0].indexOf('base64') >= 0) {
    // Convert base64 to raw binary data held in a string:
    byteString = atob(dataURIParts[1])
  } else {
    // Convert base64/URLEncoded data component to raw binary data:
    byteString = decodeURIComponent(dataURIParts[1])
  }
  let arrayBuffer = new ArrayBuffer(byteString.length)
  let intArray = new Uint8Array(arrayBuffer)

  for (let i = 0; i < byteString.length; i += 1) {
    intArray[i] = byteString.charCodeAt(i)
  }

  let mimeString = dataURIParts[0].split(':')[1].split(';')[0]
  let blob = null

  if (hasBlobConstructor) {
    blob = new Blob([hasArrayBufferViewSupport ? intArray : arrayBuffer], {
      type: mimeString
    })
  } else {
    let bb = new BlobBuilder()
    bb.append(arrayBuffer)
    blob = bb.getBlob(mimeString)
  }

  if (name) blob.name = name
  return blob
}

const promiseBlobFromCanvas = (canvas, type, quality = 1) =>
  new Promise((resolve, reject) => {
    canvas.toBlob(resolve, type, quality)
  })

const promiseReader = (file, mode = 'readAsArrayBuffer') =>
  new Promise((resolve, reject) => {
    const fr = new FileReader()
    fr.onload = resolve
    fr[mode](file)
  })

export {
  hasBlobConstructor,
  hasArrayBufferViewSupport,
  hasToBlobSupport,
  hasBlobSupport,
  hasReaderSupport,
  supportsResize,
  toBlob,
  promiseBlobFromCanvas,
  promiseReader
}
