# UPLOADER

This react Component is an interface for uploading files. This component does **not** handle the upload itself, you should use your own upload logic like edgee:slingshot for Meteor apps.

This Component does support selecting files, previewing them and add metadata.

For images, auto-rotating, resizing and cropping is possible client side. (Note that this depends on the browser used by the client!)

## Install

Install from npm:

`$ npm install @lefapps/uploader --save`

## Usage

```JSX
import React from 'react'
import Uploader, { Preview } from '@lefapps/uploader'

const FormComponent = ({ onChange }) => {
  const config = {
    // config of thumbnails for images
    sizes: [
      {
        label: 'banner-sm',
        width: 1280,
        height: 240,
        crop: true,
        retina: true,
        quality: 60
      }
    ],
    // logic to handle your file upload
    // e.g. Edgee Slingshot directive
    uploader: { send: (file, callback = (error, url) => {}) => {} }
  }
  return <Uploader {...config} onChange={onChange}>
}
```

### Uploader

The `Uploader` renders the file input, together with selected files while they are being processed. After processing, they are passed to the onChange handler. It is up to you to display these files by using the `Preview` component, which can be passed as children to the `Uploader`.

```JSX
class Form extends React.Component {
  render () {
    const bindInput = {
      onChange: value => this.setState(({ values }) =>
        ({ values: values.concat(value) })
      )
    }
    return
      <Uploader {...bindInput}>
        {this.state.values.map((value, index) =>
          <Preview {...value} key={index} />
        )}
      </Uploader>
  }
}
```

### Preview

The `Preview` component is exposed to make it possible to render the already uploaded files consistent with the files being processed. It also accepts children where you can add functionality like sorting and removing.

```JSX
<Preview url={} name={}>
  <Button onClick={remove}>x</Button>
</Preview>
```

# The Uploader

## Configuration

| Prop        | Type                | Required<br>Default | Description                                                                                                                               |
| ----------- | ------------------- | ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| label       | String<br>Component | ✗                   | Label to display above the file input                                                                                                     |
| placeholder | String              | ✗                   | Label to display inside the file input                                                                                                    |
| name        | String              | ✓                   | Name attribute of the file input element                                                                                                  |
| multiple    | Bool                | false               | Allow multiple files to be selected for upload                                                                                            |
| uploader    | Object<br>Class     | ✓                   | Logic to send the file to your storage of choice<br>See below for specific information. Works seamlessly with edgee:slingshot directives. |
| sizes       | [Object]            | ✗                   | Thumbnail configuration for image files                                                                                                   |
| invalid     | Bool                | ✗                   | Whether the input is valid or not                                                                                                         |
| id          | String              | ✗                   | Id attribute for DOM reference                                                                                                            |
| className   | String              | ✗                   | Class attribute for custom styling                                                                                                        |
| metaData    | Object              | ✗                   | Optional metadata to add to the file                                                                                                      |

### Upload handler class

You should provide the upload handler yourself. It should have at least a method `send` which accepts the file and a callback. The callback expects `error` and `result` as arguments.

```JSX
class UploadHandler {
  send (file, callback) {
    // ... send file to cloud storage
    if (error) callback(error)
    else callback(null, url)
  }
}
```

If you use a Meteor application, you can use edgee:slingshot.

```JSX
import Uploader, { Preview } from '@lefapps/uploader'
import { Slingshot } from 'meteor/edgee:slingshot'

<Uploader {...props} uploader={new Slingshot.Upload('files')}>
```

Check edgee:slingshot documentation on how to set up directives.

### Thumbnails

When you use the uploader to upload images, you can make this component to attempt creating thumbnails client-side. you can specify them through the `sizes` prop.

| Key     | Type    | Required<br>Default | Description                                                                                                                                                                                 |
| ------- | ------- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| label   | String  | ✓                   | Prefix for this thumbnail, easy to reference later<br>E.g. `square-sm`, `banner-lg`, …                                                                                                      |
| width   | Integer | ✓                   | Width of thumbnail                                                                                                                                                                          |
| height  | Integer | ✓                   | Height of thumbnail                                                                                                                                                                         |
| crop    | Bool    | false               | Whether the image should be cropped or resized<br>If crop isn't `true`, width and height act as maximal dimensions; one edge of the thumbnail will be smaller to fit within specified size. |
| quality | Number  | 60                  | Image quality between .25 and 1 or 25 and 100 %<br>Numbers greater than 100 set the quality to maximum (100 %).                                                                             |
| retina  | Bool    | false               | Create a retina version of the current thumbnail<br>Size: double; Quality: 80 % of set quality.                                                                                             |

The `label` of the size props will be used as a prefix for the uploaded thumbnail. The above examples will be stored as follows: `https://your.cdn/uploader/square-sm/filename.jpeg`

## OnChange handler

After a succesful upload, the file is passed to the `onChange` handler on the component. This "file" is actually an object with various properties which you can use to your own liking.

**Note:** when the attribute `multiple` is set on the uploader, the onChange handler is called for every file.

| Key     | Type   | Description                                                                                                                                                                                      |
| ------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| name    | String | Unique filename for all uploaded files                                                                                                                                                           |
| url     | String | success from the `send` callback, most likely the full url to the uploaded original                                                                                                              |
| local   | Blob   | use this to display the image in the preview to prevent bandwidth usage by downloading the uploaded file from `url` immediately after upload. **Note:** do not save this value in your database. |
| isImage | Bool   | Whether the uploaded file was seen as an image                                                                                                                                                   |
| error   | String | If an error occured during the process, it will appear here                                                                                                                                      |

## Image processing

When images are selected, the uploader performs the following actions:

1. **Auto rotate the image** JPEGs can have 8 rotations. When such an image is displayed on a webpage, the orientation is not always corrected. This is handled by the uploader before uploading or generating thumbnails. This auto rotation is always performed.
1. **Generate thumbnails** Based on your configuration, the requested thumbnails are created in browser using html canvas. If the user’s browser does not support the canvas element, no thumbnails are generated.
1. **Upload** Originals and thumbnails are uploaded sequentially.
1. **Call onChange handler** The handler is called once per selected image after a successful upload of the original and its thumbnails.

Example: a user selects 4 images and a pdf. The configuration requests 2 thumbnails per image.

1. The four images are rotated if necessary.
1. The 4 &times; 2 thumbnails are generated.
1. 1 pdf, 4 original images and 8 thumbnails are uploaded.
1. The handler is called 5 times. If n uploads fail, the handler is called 5 - n times.

# The Preview

**Simple usage:** if you pass the onChange argument as `...props` to the `Preview` component, it will be displayed fine.

## Configuration

| Prop     | Type      | Required<br>Default | Description                                                                                                          |
| -------- | --------- | ------------------- | -------------------------------------------------------------------------------------------------------------------- |
| name     | String    | ''                  | Name of the file                                                                                                     |
| url      | String    | ''                  | Url of preview (image)<br>If no preview is available, the file type will be shown instead.                           |
| local    | String    | ''                  | Urlstring of the local image, overrides url if present                                                               |
| error    | String    | ''                  | Display an error message instead of the preview                                                                      |
| children | Component | ✗                   | Extend preview functionality to remove, sort, …                                                                      |
| extras   | Component | ✗                   | Optional children below the filename<br>Use this prop to add e.g. alt-tag and/or copyright information after upload. |

### Children

Example of sorting and removing:

```JSX
class FormComponent extends React.Component {
  _getValue () {
    const { bindInput, element } = this.props
    return bindInput(element.name) // see @lefapps/forms
  }
  _modifyModel (action, { index, model, direction }) {
    let { name, value, onChange, multiple } = this._getValue()
    switch (action) {
      case 'create':
        multiple ? value.splice(value.length, 0, model) : (value = model)
        break
      case 'update':
        multiple ? value.splice(index, 1, model) : (value = model)
        break
      case 'delete':
        if (confirm('Are you sure you want to delete this file?')) {
          multiple ? value.splice(index, 1) : (value = undefined)
        }
        break
      case 'move':
        if (multiple) {
          value.splice(index, 1)
          value.splice(index + direction, 0, model)
        }
        break
    }
    this.setState({ value })
    return value
  }
  move = (index, direction) => {
    const model = this._getValue().value[index]
    this._modifyModel('move', { index, direction, model })
  }
  remove = index => {
    this._modifyModel('delete', { index })
  }
  canMove = (index, direction) => {
    const { value, multiple } = this.props.bindInput(this.props.element.name)
    return (
      multiple &&
      ((direction > 0 && index < value.length - 1) ||
        (direction < 0 && index > 0))
    )
  }
  render() {
    return
      <Uploader onChange={model => this._modifyModel('create', { model })} {...config}>
        {this.state.values.map((value, index) =>
          <Preview key={index} {...value}>
            <ButtonGroup>
              <Button onClick={() => this.move(index, -1)} disabled={!this.canMove(index, -1)}>
                △
              </Button>
              <Button onClick={() => this.move(index, 1)} disabled={!this.canMove(index, 1)} >
                ▽
              </Button>
              <Button onClick={() => this.remove(index)}>✕</Button>
            </ButtonGroup>
          </Preview>
        )}
      </Uploader>
  }
}
```

### Extras

If you want even more options, you can an extra set of children to display below the filename.

Example of an alt-tag field:

```JSX
class FormComponent extends React.Component {
  _getValue () {
    const { bindInput, element } = this.props
    return bindInput(element.name) // see @lefapps/forms
  }
  _modifyModel (action, { index, model, direction }) {
    let { name, value, onChange, multiple } = this._getValue()
    switch (action) {
      case 'create':
        multiple ? value.splice(value.length, 0, model) : (value = model)
        break
      case 'update':
        multiple ? value.splice(index, 1, model) : (value = model)
        break
      case 'delete':
        if (confirm('Are you sure you want to delete this file?')) {
          multiple ? value.splice(index, 1) : (value = undefined)
        }
        break
      case 'move':
        if (multiple) {
          value.splice(index, 1)
          value.splice(index + direction, 0, model)
        }
        break
    }
    this.setState({ value })
    return value
  }
  metaFields (isImage) {
    return isImage ? [{ name: 'alt', type: 'text' }] : []
  }
  metaFieldBuilder (value, index) {
    return ({ name, type }, key) => (
      <Input
        key={key}
        type={type}
        defaultValue={value[name]}
        placeholder={name}
        onChange={({ target }) =>
          this._modifyModel('update', {
            index,
            model: Object.assign(value, {
              [name]: target.value
            })
          })
        }
      />
    )
  }
  render () {
    return
      <Uploader
        onChange={model => this._modifyModel('create', { model })}
        {...config}
      >
        {values.map((value, index) =>
          <Preview
            {...value}
            key={index}
            extras={this.metaFields(value.isImage).map(this.metaFieldBuilder(value, index))}
          />
        )}
      </Uploader>
  }
}
```
