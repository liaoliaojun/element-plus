interface EnhancedError extends Error {
  status: number
  method: string
  url: string
}

interface EnhancedProgressEvent extends ProgressEvent {
  percent: number
}

interface RequestOptions {
  action: string
  data: Record<string, string | Blob>
  filename: string
  file: File
  headers: Headers
  onError: (e: Error) => void
  onProgress: (e: ProgressEvent) => void
  onSuccess: (response: XMLHttpRequestResponseType) => unknown
  withCredentials: boolean
}

function getError(action: string, option: RequestOptions, xhr: XMLHttpRequest) {
  let msg
  if (xhr.response) {
    msg = `${xhr.response.error || xhr.response}`
  } else if (xhr.responseText) {
    msg = `${xhr.responseText}`
  } else {
    msg = `fail to post ${action} ${xhr.status}`
  }

  const err = new Error(msg) as EnhancedError
  err.status = xhr.status
  err.method = 'post'
  err.url = action
  return err
}

function getBody(xhr: XMLHttpRequest): XMLHttpRequestResponseType {
  const text = xhr.responseText || xhr.response
  if (!text) {
    return text
  }

  try {
    return JSON.parse(text)
  } catch (e) {
    return text
  }
}

export default function upload(option: RequestOptions) {
  if (typeof XMLHttpRequest === 'undefined') {
    return
  }

  const xhr = new XMLHttpRequest()
  const action = option.action

  if (xhr.upload) {
    xhr.upload.onprogress = function progress(e) {
      if (e.total > 0) {
        (e as EnhancedProgressEvent).percent = e.loaded / e.total * 100
      }
      option.onProgress(e)
    }
  }

  const formData = new FormData()

  if (option.data) {
    Object.keys(option.data).forEach(key => {
      formData.append(key, option.data[key])
    })
  }

  formData.append(option.filename, option.file, option.file.name)

  xhr.onerror = function error(e) {
    option.onError(getError(action, option, xhr))
  }

  xhr.onload = function onload() {
    if (xhr.status < 200 || xhr.status >= 300) {
      return option.onError(getError(action, option, xhr))
    }

    option.onSuccess(getBody(xhr))
  }

  xhr.open('post', action, true)

  if (option.withCredentials && 'withCredentials' in xhr) {
    xhr.withCredentials = true
  }

  const headers = option.headers || {}

  for (const item in headers) {
    if (headers.hasOwnProperty(item) && headers[item] !== null) {
      xhr.setRequestHeader(item, headers[item])
    }
  }
  xhr.send(formData)
  return xhr
}
