import React from 'react'
import PropTypes from 'prop-types'
import { Spinner, Alert, ButtonGroup, Button } from 'reactstrap'

import { supportedImages, typeColor } from './helpers'

const replaceWithType = (node, type) => {
  const tc = typeColor(type.toLowerCase())
  const parent = node.parentElement
  const child = document.createElement('strong')
  child.style.color = tc.color
  child.innerText = type.toUpperCase()
  parent.appendChild(child)
  node.style.display = 'none'
}

const Preview = ({ children, error, extras, _remove, ...props }) => {
  const { url, name, local } = props
  const type = name ? name.split('.').pop() : url ? url.split('.').pop() : ''
  const basename = name ? name.slice(0, name.lastIndexOf('-')) : url || ''
  const isImage = supportedImages.includes(type.toLowerCase())
  return error ? (
    <tr>
      <td colSpan={_remove ? 2 : 3}>
        <strong>{name}</strong>
        <br />
        <Alert color={'danger'}>{error.reason}</Alert>
      </td>
      {_remove ? (
        <td>
          <ButtonGroup>
            <Button
              color={'danger'}
              size={'sm'}
              outline
              onClick={_remove}
              disabled={!_remove}
              title={'Remove'}
            >
              ✕
            </Button>
          </ButtonGroup>
        </td>
      ) : null}
    </tr>
  ) : (
    <tr>
      <th
        className={'p-0'}
        style={{ width: '6em', textAlign: 'center', verticalAlign: 'middle' }}
      >
        {url || local ? (
          <a
            href={url || ''}
            download={name}
            target={'_blank'}
            style={{ color: 'inherit' }}
          >
            {isImage ? (
              <img
                src={local || url || ''}
                alt={'preview'}
                style={{
                  display: 'block',
                  width: '100%',
                  height: '6em',
                  objectFit: 'cover'
                }}
                onError={({ target }) => replaceWithType(target, type)}
              />
            ) : (
              <strong style={typeColor(type.toLowerCase())}>
                {type.toUpperCase()}
              </strong>
            )}
          </a>
        ) : (
          <Spinner size='sm' color='primary' />
        )}
      </th>
      <td style={{ verticalAlign: 'middle' }}>
        <strong>{basename}</strong>
        {extras ? (
          <>
            <br />
            {extras}
          </>
        ) : null}
      </td>
      <td style={{ textAlign: 'right', verticalAlign: 'middle' }}>
        {children}
      </td>
    </tr>
  )
}

Preview.propTypes = {
  name: PropTypes.string,
  url: PropTypes.string,
  local: PropTypes.string,
  error: PropTypes.string,
  _remove: PropTypes.func
}

export default Preview
