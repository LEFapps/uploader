import { supportedImages } from '../helpers'
import {
  supportsResize,
  promiseBlobFromCanvas,
  hasToBlobSupport,
  toBlob,
  promiseReader
} from './blob'

const orient = readEvent => {
  const view = new DataView(readEvent.target.result)
  if (view.getUint16(0, false) !== 0xffd8) {
    return -2
  }
  const length = view.byteLength

  let offset = 2
  while (offset < length) {
    if (view.getUint16(offset + 2, false) <= 8) return -1
    const marker = view.getUint16(offset, false)
    offset += 2
    if (marker === 0xffe1) {
      if (view.getUint32((offset += 2), false) !== 0x45786966) {
        return -1
      }

      const little = view.getUint16((offset += 6), false) === 0x4949
      offset += view.getUint32(offset + 4, little)
      const tags = view.getUint16(offset, little)
      offset += 2
      for (let i = 0; i < tags; i++) {
        if (view.getUint16(offset + i * 12, little) === 0x0112) {
          return view.getUint16(offset + i * 12 + 8, little)
        }
      }
    } else if ((marker & 0xff00) !== 0xff00) {
      break
    } else {
      offset += view.getUint16(offset, false)
    }
  }
  return -1
}

const getOrientation = file =>
  new Promise((resolve, reject) =>
    promiseReader(file, 'readAsArrayBuffer').then(readEvent =>
      resolve(orient(readEvent))
    )
  )

const fixOrientation = (file, name) => {
  const image = document.createElement('img')

  const rotate = orientation => {
    const canvas = document.createElement('canvas')
    const { width, height } = image

    /* Rename and pass-through original if not supported */
    const type = (file.name && file.name.split('.').pop()) || file.type
    if (!supportsResize() || !supportedImages.includes(type)) {
      return new Blob([file], { type: file.type })
    }

    if ([5, 6, 7, 8].includes(orientation)) {
      // 90° rotated
      canvas.width = height
      canvas.height = width
    } else {
      // straight
      canvas.width = width
      canvas.height = height
    }

    /* Prepare canvas */
    const ctx = canvas.getContext('2d')
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'
    ctx.save()

    /* Transform canvas for image rotation */
    if (orientation === 2) ctx.transform(-1, 0, 0, 1, width, 0)
    else if (orientation === 3) ctx.transform(-1, 0, 0, -1, width, height)
    else if (orientation === 4) ctx.transform(1, 0, 0, -1, 0, height)
    else if (orientation === 5) ctx.transform(-1, 0, 0, 1, 0, 0)
    else if (orientation === 6) ctx.transform(1, 0, 0, 1, height, 0)
    else if (orientation === 7) ctx.transform(-1, 0, 0, 1, height, width)
    else if (orientation === 8) ctx.transform(1, 0, 0, 1, 0, width)
    else ctx.transform(1, 0, 0, 1, 0, 0)
    if ([5, 6].includes(orientation)) ctx.rotate(Math.PI / 2)
    if ([7, 8].includes(orientation)) ctx.rotate(-Math.PI / 2)

    /* Drawing */
    ctx.drawImage(image, 0, 0)
    ctx.restore()

    /* Export Blob from canvas */
    return hasToBlobSupport
      ? promiseBlobFromCanvas(canvas, file.type).then(blob => blob)
      : toBlob(canvas, file.type)
  }

  const fixImage = () => getOrientation(file).then(rotate)

  const loadImage = () =>
    new Promise((resolve, reject) => (image.onload = resolve)).then(fixImage)

  if (typeof URL === 'undefined') {
    return promiseReader(file, 'readAsDataURL').then(e => {
      image.src = e.target.result
      return loadImage()
    })
  } else {
    image.src = URL.createObjectURL(file)
    return loadImage()
  }
}

export default fixOrientation
