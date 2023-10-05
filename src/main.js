const $add = document.getElementById('add')
const $addContainer = document.getElementById('add-container')
const $first = document.getElementById('first')
const $input = document.getElementById('input')
const $messages = document.getElementById('messages')

const RESIZE_COMMAND = 'resize'
const FOCUS_COMMAND = 'focus'
const BLUR_COMMAND = 'blur'
const MESSAGE_COMMAND = 'message'

let children = {}

const channel = new BroadcastChannel('main');
const num = location.search.substring(1)
const id = window.opener ? 'child' + num : 'parent'

const setSize = ($elem, width, height) => {
  $elem.children[0].innerHTML = `${width} x ${height}`
  $elem.style.aspectRatio = `${width} / ${height}`
}

const setFocus = ($elem) => {
  $elem.className += ' focus'
}

const setBlur = ($elem) => {
  $elem.className = $elem.className.replace(' focus', '')
}

const addMessage = (message) => {
  const $message = document.createElement('div')
  $message.className = 'message'
  $message.innerHTML = message
  $messages.append($message)
  setTimeout(() => {
    $message.remove()
  }, 5000)
}

setSize($first, window.innerWidth, window.innerHeight)
setFocus($first)

if (window.opener) {
  document.title = `Écran n°${num}`
  $first.children[1].innerHTML = num

  $addContainer.remove()
  channel.postMessage({
    id,
    command: RESIZE_COMMAND,
    data: {
      width: window.innerWidth, 
      height: window.innerHeight
    }
  })
  channel.postMessage({
    id,
    command: FOCUS_COMMAND
  })
    
  channel.onmessage = (e) => {
    console.log(e.data);
  }

  window.onresize = () => {
    setSize($first, window.innerWidth, window.innerHeight)
    channel.postMessage({
      id,
      command: RESIZE_COMMAND,
      data: {
        width: window.innerWidth, 
        height: window.innerHeight
      }
    })
  }

  window.onfocus = () => {
    setFocus($first)
    channel.postMessage({
      id,
      command: FOCUS_COMMAND
    })
  }
  
  window.onblur = () => {
    setBlur($first)
    channel.postMessage({
      id,
      command: BLUR_COMMAND
    })
  }

  channel.onmessage = (e) => {
    const { id, command, data } = e.data

    console.log(`[${command}]`, id, data);

    switch (command) {
      case MESSAGE_COMMAND:
        addMessage(data.message)
        break
    }
  }
} else {
  document.title = 'Écran principal'

  $add.onclick = () => {
    const childId = Object.keys(children).length + 2
    const openedWindow = window.open('index.html?' + (childId))
    const $screen = document.createElement('div')
    $screen.className = 'screen'
    $screen.innerHTML = `<span></span><h2>${childId}</h2>`
    children['child' + childId] = {
      window: openedWindow,
      screen: $screen
    }
    $addContainer.before($screen)
  
    openedWindow.addEventListener('unload', () => {
      setTimeout(() => {
        if (openedWindow.closed) $screen.remove()
      }, 100);
    })

    $screen.onclick = () => {
      openedWindow.focus()
    }
  }

  channel.onmessage = (e) => {
    const { id, command, data } = e.data

    console.log(`[${command}]`, id, data);

    switch (command) {
      case RESIZE_COMMAND:
        setSize(children[id].screen, data.width, data.height)
        break
      case FOCUS_COMMAND:
        setFocus(children[id].screen)
        break
      case BLUR_COMMAND:
        setBlur(children[id].screen)
        break
      case MESSAGE_COMMAND:
        addMessage(data.message)
        break
    }
  }

  window.onresize = () => {
    setSize($first, window.innerWidth, window.innerHeight)
  }

  window.onfocus = () => {
    setFocus($first)
  }

  window.onblur = () => {
    setBlur($first)
  }
}

$input.onkeyup = (e) => {
  if (e.code === 'Enter') {
    channel.postMessage({
      command: MESSAGE_COMMAND,
      data: {
        message: $input.value
      }
    })
    $input.value = ''
  }
}