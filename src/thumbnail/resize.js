import {
  hasToBlobSupport,
  toBlob,
  promiseBlobFromCanvas,
  promiseReader
} from './blob'

const setQuality = quality =>
  quality > 100
    ? 0.6 // default 60 %
    : quality > 1
      ? Math.min(1, quality / 100) // max 100 %
      : Math.max(0.25, quality) // min 25 %

const generateThumbnail = (
  file,
  name,
  { label, quality, crop, ...modifier }
) => {
  quality = setQuality(quality)
  const image = document.createElement('img')

  const resize = () => {
    const canvas = document.createElement('canvas')

    /* Set variables */
    let { width, height } = image
    let drawWidth = modifier.width
    let drawHeight = modifier.height
    let offsetX = 0
    let offsetY = 0

    /* Calculate size */
    if (crop) {
      if (width / height < modifier.width / modifier.height) {
        /* top-bottom falloff */
        drawHeight = (modifier.width / width) * height
        offsetY = (modifier.height - drawHeight) / 2
      } else {
        /* left-right falloff */
        drawWidth = (modifier.height / height) * width
        offsetX = (modifier.width - drawWidth) / 2
      }
      width = modifier.width
      height = modifier.height
    } else {
      if (width >= height && width > modifier.width) {
        /* width is the largest dimension, and it's too big. */
        height *= modifier.width / width
        width = modifier.width
      } else if (height > modifier.height) {
        /* either width wasn't over-size or
         * height is the largest dimension and
         * the height is over-size **/
        width *= modifier.height / height
        height = modifier.height
      }
    }

    /* Prepare canvas */
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'

    /* Draw Image */
    if (crop) ctx.drawImage(image, offsetX, offsetY, drawWidth, drawHeight)
    else ctx.drawImage(image, 0, 0, width, height)

    /* Export Blob from canvas */
    const filename = `${label}/${name}`
    return hasToBlobSupport
      ? promiseBlobFromCanvas(canvas, file.type).then(blob => {
        blob.name = filename
        return blob
      })
      : toBlob(canvas, file.type, filename)
  }

  const loadImage = () =>
    new Promise((resolve, reject) => (image.onload = resolve)).then(resize)

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

export default generateThumbnail
