import kebabCase from 'lodash/kebabCase'
import deburr from 'lodash/deburr'
const colors = {
  pdf: 'FIREBRICK',
  doc: 'ROYALBLUE',
  docx: 'ROYALBLUE',
  xls: 'SEAGREEN',
  xlsx: 'SEAGREEN',
  ppt: 'TOMATO',
  pptx: 'TOMATO',
  tiff: 'CADETBLUE',
  zip: 'ROSYBROWN'
}
const _randomSource =
  'azertyuiopqsdfghjklmwxcvbnAZERTYUIOPQSDFGHJKLMWXCVBN0123456789'

const random = length => {
  length = !length ? 8 : length
  const range = _randomSource.length
  let result = ''
  for (let index = 0; index < length; index++) {
    result += _randomSource[Math.floor(Math.random() * range)]
  }
  return result
}

const safeName = name => {
  const nameParts = name.split('.')
  const extension = nameParts.pop()
  const fileName = nameParts.join('.').slice(0, 32)
  return kebabCase(deburr(fileName)) + '-' + random(5) + '.' + extension
}

const retinaSize = ({ width, height, quality = 0.6, ...size }) =>
  Object.assign(size, {
    width: width * 2,
    height: height * 2,
    quality: quality * 0.8
  })

const retinaName = name =>
  name
    .split('.')
    .map((n, i, { length }) => (i === length - 2 ? n + '@2x' : n))
    .join('.')

const supportedImages = ['image/jpeg', 'image/png', 'jpg', 'jpeg', 'png']

const typeColor = type => (type ? { color: colors[type] || '' } : {})

export { safeName, retinaSize, retinaName, random, supportedImages, typeColor }
