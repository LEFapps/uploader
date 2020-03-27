import React from 'react'
import { Progress } from 'reactstrap'
import isString from 'lodash/isString'

import Preview from './Preview'
import { safeName, retinaName, retinaSize, supportedImages } from './helpers'
import { isSupported } from './thumbnail/blob'
import fixOrientation from './thumbnail/rotate'
import generateThumbnail from './thumbnail/resize'

class UserFile extends React.Component {
  constructor (props) {
    super(props)
    const type = this.props.file.type
    const name = safeName(this.props.file.name)
    const source = new File([this.props.file], name, { type })
    const isImage = supportedImages.includes(type)
    this._progressor = isImage
      ? ['init', 'rotate', 'resize', 'upload', 'finish']
      : ['init', 'upload', 'finish']
    this._requiredThumbs = this.props.sizes
      ? this.props.sizes.length +
        this.props.sizes.filter(({ retina }) => retina).length
      : 0
    this.state = {
      source,
      name,
      isImage,
      local: false,
      url: false,
      thumbnails: [],
      resized: 0,
      progress: -1,
      uploaded: 0,
      error: null
    }
  }

  componentDidMount () {
    this.setProgress('init')
  }

  setProgress = step => {
    const max = this._progressor.length - 1
    let progress = (this.state.progress || 0) + 1
    if (step) {
      const stepIndex = this._progressor.indexOf(step)
      if (stepIndex >= 0) progress = stepIndex
    }
    if (progress >= 0 && progress <= max && progress !== this.state.progress) {
      this.setState({ progress }, () =>
        this[this._progressor[this.state.progress]]()
      )
    }
  }

  init () {
    const { source, isImage } = this.state
    if (!isImage) {
      /* Not an image */
      this.setState({ resized: true, local: true }, this.setProgress)
    } else if (!isSupported()) {
      /* No resizing available */
      this.setState({ resized: true, local: URL.createObjectURL(source) }, () =>
        this.setProgress('upload')
      )
    } else {
      /* Resizing available, throw original at resizer to fix rotation */
      this.setProgress()
    }
  }

  rotate () {
    const { name, source } = this.state
    fixOrientation(source).then(rotated => {
      const local = URL.createObjectURL(rotated || source)
      if (!rotated) {
        return this.setState({ resized: true, local }, this.setProgress)
      }
      rotated.name = name
      this.setState({ source: rotated, local }, this.setProgress)
    })
  }

  resizeThumb = file => {
    const thumbnails = this.state.thumbnails.concat([file])
    this.setState({ thumbnails, resized: thumbnails.length }, () =>
      this.state.resized >= this._requiredThumbs ? this.setProgress() : null
    )
  }

  resize () {
    if (this.props.sizes && this.props.sizes.length) {
      this.props.sizes.forEach(size => {
        const { name, source } = this.state
        generateThumbnail(source, name, size).then(this.resizeThumb)
        if (size.retina) {
          generateThumbnail(source, retinaName(name), retinaSize(size)).then(
            this.resizeThumb
          )
        }
      })
    } else this.setState({ resized: true }, this.setProgress)
  }

  uploadFile = file => {
    this.props.uploader.send(file, (error, url) => {
      if (error) {
        this.setState({
          error: isString(error) ? error : JSON.stringify(error)
        })
      } else {
        url = this.state.url || url
        const { thumbnails } = this.state
        const file = thumbnails.shift()
        this.setState(
          ({ uploaded }) => ({
            uploaded: uploaded + (error ? 0 : 1),
            thumbnails,
            url
          }),
          () => (file ? this.uploadFile(file) : this.setProgress())
        )
      }
    })
  }

  upload () {
    const { source } = this.state
    this.uploadFile(source)
  }

  finish () {
    const { name, isImage, local, url, error } = this.state
    this.props.onFinish({ name, isImage, local, url, error })
  }

  render () {
    const { progress } = this.state
    return (
      <>
        <Preview {...this.state} _remove={() => this.props.onFinish()}>
          <Progress value={(100 * progress) / (this._progressor.length - 1)} />
          <span>{this._progressor[progress]}</span>
        </Preview>
      </>
    )
  }
}

export default UserFile
