const $add = document.getElementById('add')
const $ping = document.getElementById('ping')
const $first = document.getElementById('first')

const RESIZE_COMMAND = 'resize'

let children = {}

const channel = new BroadcastChannel('main');

$first.children[0].innerHTML = `${window.innerWidth} x ${window.innerHeight}`

const num = location.search.substring(1)
const id = window.opener ? 'child' + num : 'parent'

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
        children[id].screen.children[0].innerHTML = `${data.width} x ${data.height}`
        break;
    }
  }

  window.onresize = () => {
    $first.children[0].innerHTML = `${window.innerWidth} x ${window.innerHeight}`
  }
}

$ping.onclick = () => {
  channel.postMessage({
    id,
    command: PING_COMMAND
  })
}