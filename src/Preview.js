import React from 'react'
import PropTypes from 'prop-types'
import { Spinner, Alert, ButtonGroup, Button } from 'reactstrap'

import { supportedImages } from './helpers'

const Preview = ({ children, error, metaFields, _remove, ...props }) => {
  const { url, name } = props
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
        {url ? (
          isImage ? (
            <img
              src={url}
              alt={'preview'}
              style={{
                display: 'block',
                width: '100%',
                height: '6em',
                objectFit: 'cover'
              }}
            />
          ) : (
            <strong>{type.toUpperCase()}</strong>
          )
        ) : (
          <Spinner size='sm' color='primary' />
        )}
      </th>
      <td style={{ verticalAlign: 'middle' }}>
        <strong>{basename}</strong>
        {metaFields ? (
          <>
            <br />
            {metaFields}
          </>
        ) : null}
      </td>
      <td style={{ textAlign: 'right', verticalAlign: 'middle' }}>
        {children}
      </td>
    </tr>
  )
}

export default Preview
