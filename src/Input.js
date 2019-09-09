import React from 'react'
import PropTypes from 'prop-types'
import { CustomInput } from 'reactstrap'

import { random } from './helpers'

const FileInput = ({
  name,
  label,
  placeholder,
  multiple,
  invalid,
  onChange
}) => {
  const addFiles = ({ target }) => {
    if (!target || !target.files || !target.files.length) {
      console.warn('[reactCustomFileInput] No file(s) selected!')
    } else {
      const files = []
      for (let index = 0; index < target.files.length; index++) {
        files.push(target.files[index])
      }
      onChange(files)
    }
  }
  return (
    <CustomInput
      id={random()}
      className={'reactCustomFileInput__input'}
      type={'file'}
      multiple={multiple}
      name={name || 'file'}
      label={placeholder || label || undefined}
      invalid={invalid}
      onChange={addFiles}
    />
  )
}

FileInput.propTypes = {
  onChange: PropTypes.func.isRequired,
  multiple: PropTypes.bool,
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  placeholder: PropTypes.string,
  invalid: PropTypes.bool
}

export default FileInput
