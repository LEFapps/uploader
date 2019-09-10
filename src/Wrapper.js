import React from 'react'
import PropTypes from 'prop-types'
import { Alert, FormGroup, Table } from 'reactstrap'

import FileInput from './Input'
import UserFile from './File'

class Wrapper extends React.Component {
  constructor (props) {
    super(props)
    this.state = { files: [], fileCount: 0 }
  }
  addFiles = newFiles =>
    this.setState(({ files, fileCount }) => ({
      files: this.props.multiple ? files.concat(newFiles) : newFiles,
      fileCount: this.props.multiple ? fileCount + newFiles.length : !fileCount
    }))
  setFile (value, index) {
    this.setState(
      ({ files }) => {
        const newFiles = files.map((v, k) => (k === index ? false : v))
        return {
          files: newFiles,
          fileCount: newFiles.filter(v => v).length
        }
      },
      () => (value ? this.props.onChange(value) : null)
    )
  }
  render () {
    const { id, className, sizes, uploader, children } = this.props
    const { files, error } = this.state
    return (
      <FormGroup
        id={id || undefined}
        className={'reactCustomFileInput ' + (className || '')}
      >
        <div className={'reactCustomFileInput__value'}>
          <Table>
            <thead />
            <tbody>
              {children}
              {(files || []).map((f, j) =>
                f ? (
                  <UserFile
                    file={f}
                    sizes={sizes}
                    uploader={uploader}
                    onFinish={value => this.setFile(value, j)}
                    key={j}
                  />
                ) : null
              )}
            </tbody>
          </Table>
        </div>
        <FileInput {...this.props} onChange={this.addFiles} />
        {error ? <Alert color={'danger'}>{error}</Alert> : null}
      </FormGroup>
    )
  }
}

Wrapper.propTypes = {
  onChange: PropTypes.func.isRequired,
  thumbnails: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      width: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
        .isRequired,
      height: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
        .isRequired,
      crop: PropTypes.bool,
      retina: PropTypes.bool,
      quality: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
    })
  ),
  multiple: PropTypes.bool,
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  placeholder: PropTypes.string,
  id: PropTypes.string,
  className: PropTypes.string,
  invalid: PropTypes.bool
}

export default Wrapper
