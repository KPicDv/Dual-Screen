const $add = document.getElementById('add')
const $first = document.getElementById('first')

const RESIZE_COMMAND = 'resize'

let children = {}

const channel = new BroadcastChannel('main');
const num = location.search.substring(1)
const id = window.opener ? 'child' + num : 'parent'

const setSize = ($elem, width, height) => {
  $elem.children[0].innerHTML = `${width} x ${height}`
  $elem.style.aspectRatio = `${width} / ${height}`
}

setSize($first, window.innerWidth, window.innerHeight)

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
    
  channel.onmessage = (e) => {
    console.log(e.data);
  }

  window.onresize = () => {
    $first.children[0].innerHTML = `${window.innerWidth} x ${window.innerHeight}`
    channel.postMessage({
      id,
      command: RESIZE_COMMAND,
      data: {
        width: window.innerWidth, 
        height: window.innerHeight
      }
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
        console.log(children[id].screen);
        setSize(children[id].screen, data.width, data.height)
        break;
    }
  }

  window.onresize = () => {
    setSize($first, window.innerWidth, window.innerHeight)
  }
}