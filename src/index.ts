import './style.css'
import * as PIXI from 'pixi.js'
import backgroundImage from './assets/bg.png'
import doorImage from './assets/door.png'
import handleImage from './assets/handle.png'
import handleShadowImage from './assets/handleShadow.png'
import doorOpenImage from './assets/doorOpen.png'

const app: PIXI.Application = new PIXI.Application()
await app.init({ 
  width: window.innerWidth,
  height: window.innerHeight,
  resizeTo: window,
})
document.body.appendChild(app.canvas)

await PIXI.Assets.load<PIXI.Texture>([
  backgroundImage,
  doorImage,
  handleImage,
  handleShadowImage,
  doorOpenImage
])

const backgroundContainer: PIXI.Container = new PIXI.Container()
app.stage.addChild(backgroundContainer)

const background: PIXI.Sprite = PIXI.Sprite.from(backgroundImage)
background.anchor.set(0.5)

backgroundContainer.addChild(background)

const doorContainer: PIXI.Container = new PIXI.Container()
// doorContainer.pivot.set(0.5)
backgroundContainer.addChild(doorContainer)

const door: PIXI.Sprite = PIXI.Sprite.from(doorImage)
door.anchor.set(0.5)
door.width = 600
door.height = 550

// door.visible = false

doorContainer.addChild(door)

const handleContainer: PIXI.Container = new PIXI.Container()
door.addChild(handleContainer)

const handleShadow: PIXI.Sprite = PIXI.Sprite.from(handleShadowImage)
handleShadow.width = 658
handleShadow.height = 729
handleShadow.anchor.set(0.62, 0.47)
handleContainer.addChild(handleShadow)

const handle: PIXI.Sprite = PIXI.Sprite.from(handleImage)
handle.width = 677
handle.height = 748
handle.anchor.set(0.63, 0.52)

handleContainer.addChild(handle)

const doorOpen: PIXI.Sprite = PIXI.Sprite.from(doorOpenImage)
doorOpen.anchor.set(0.5)
doorOpen.visible = false
doorContainer.addChild(doorOpen)

const resizeElements = () => {
  background.x = app.screen.width / 2
  background.y = app.screen.height / 2

  const scaleX = app.screen.width / background.texture.width
  const scaleY = app.screen.height / background.texture.height
  const scale = Math.max(scaleX, scaleY)
  background.scale.set(scale)

  door.x = app.screen.width / 2 + 10
  door.y = app.screen.height / 2 - 8
  door.scale.set(scale)

  doorOpen.x = app.screen.width / 2 + 460
  doorOpen.y = app.screen.height / 2
  doorOpen.scale.set(scale)
}

// let isDoorOpened = false

const openDoor = () => {
  // isDoorOpened = true
  door.visible = false
  doorOpen.visible = true
}

app.renderer.on('resize', resizeElements);
resizeElements();

const generateCombination = (): number[] => {
  const combination: number[] = []
  for (let i = 0; i < 3; i++) {
    const step: number = (Math.random() < 0.5 ? 1 : -1) * (Math.floor(Math.random() * 9) + 1);
    combination.push(step)
  }
  return combination
}

let combination: number[] = generateCombination()

const showCombinationInConsole = () => {
  combination.forEach((step) => {
    console.log(`${Math.abs(step)} ${step > 0 ? 'clockwise' : 'counterclockwise'}`);
  })
}

showCombinationInConsole()

const baseStep: number = 1;
let userPosition = 0;
let userStep = 0;
let handleRotation = 0;


// const rotateHandle = (direction: 'clockwise' | 'counterclockwise', step: number) => {
//   const angle = direction === 'clockwise' ? step : -step
//   handleRotation += angle

//   checkInput()
// }
const rotateHandle = (step: number) => {
  handleRotation += step
  checkInput()
}

const checkInput = () => {
  const currentCombination = combination[userPosition];

  if (currentCombination === userStep) {
    console.log(`Position ${userPosition + 1} guessed correctly!`);
    userPosition++;
    userStep = 0;

    if (userPosition === combination.length) {
      openDoor()
      showMessage(true)
      console.log('Safe unlocked!');
    }
  } else if (Math.abs(userStep) >= 9) {
    resetGame()
    showMessage(false)
  }
};

const showMessage = (isWinner: boolean): void => {
  const ticker = new PIXI.Ticker()
  let scale: number = 0

  const messageText = isWinner ? 'CONGRATULATIONS' : 'TRY AGAIN'
  const messageColor = isWinner ? 0x176969 : 0x800020

  const message = new PIXI.Text({ text: messageText, style: {
    fontFamily: 'Arial',
    fontSize: 50,
    fill: messageColor,
  }});

  message.x = background.width / 2 - message.width / 1.5
  message.y = 50
  backgroundContainer.addChild(message)

  ticker.add((): void => {
    if (scale < 1) {
      scale += 0.1
      message.scale.set(scale)
    } else {
      message.scale.set(1)
      ticker.stop()
    }
  })
  ticker.start()
};

const resetGame = () => {
  console.log('Combination reset. Start over.')
  userPosition = 0
  userStep = 0
  combination = generateCombination()
  showCombinationInConsole()
};

const leftButton = document.getElementById('left-arrow')
const rightButton = document.getElementById('right-arrow')

leftButton.addEventListener('click', () => { 
  // const step = 1;
  userStep -= baseStep;
  const direction = 'counterclockwise';
  rotateHandle(userStep)
  console.log(userStep);
})

rightButton.addEventListener('click', () => { 
  // const step = 1;
  userStep += baseStep;
  const direction = 'clockwise';
  rotateHandle(userStep)
  console.log(userStep);
})

