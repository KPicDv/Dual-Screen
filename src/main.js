const $add = document.getElementById('add')
const $first = document.getElementById('first')

const RESIZE_COMMAND = 'resize'
const FOCUS_COMMAND = 'focus'
const BLUR_COMMAND = 'blur'

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

setSize($first, window.innerWidth, window.innerHeight)
setFocus($first)

if (window.opener) {
  document.title = `Écran n°${num}`
  $first.children[1].innerHTML = num

  $add.remove()
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
    $add.before($screen)
  
    openedWindow.addEventListener('unload', () => {
      setTimeout(() => {
        if (openedWindow.closed) $screen.remove()
      }, 100);
    })
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