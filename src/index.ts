import './style.css'
import * as PIXI from 'pixi.js'
import { gsap } from "gsap";
import backgroundImage from './assets/bg.png'
import doorImage from './assets/door.png'
import handleImage from './assets/handle.png'
import handleShadowImage from './assets/handleShadow.png'
import doorOpenImage from './assets/doorOpen.png'
import blinkImage from './assets/blink.png'
import doorOpenShadowImage from './assets/doorOpenShadow.png'

const baseStep: number = 1;
let userPosition: number = 0;
let userStep: number = 0;

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
  doorOpenImage,
  blinkImage,
  doorOpenShadowImage
])

const backgroundContainer: PIXI.Container = new PIXI.Container()
app.stage.addChild(backgroundContainer)

const background: PIXI.Sprite = PIXI.Sprite.from(backgroundImage)
background.anchor.set(0.5)
backgroundContainer.addChild(background)

const doorContainer: PIXI.Container = new PIXI.Container()
backgroundContainer.addChild(doorContainer)

const door: PIXI.Sprite = PIXI.Sprite.from(doorImage)
door.anchor.set(0.5)
door.width = 600
door.height = 550
doorContainer.addChild(door)

const handleContainer: PIXI.Container = new PIXI.Container()
door.addChild(handleContainer)

const handleShadow: PIXI.Sprite = PIXI.Sprite.from(handleShadowImage)
handleShadow.width = 658
handleShadow.height = 729
handleShadow.x = 30
handleShadow.y = 35
handleContainer.addChild(handleShadow)

const handle: PIXI.Sprite = PIXI.Sprite.from(handleImage)
handle.width = 677
handle.height = 748
handleContainer.addChild(handle)

handleContainer.pivot.set(handle.width / 2, handle.height / 2)
handleContainer.x = -90

const doorOpenContainer: PIXI.Container = new PIXI.Container()
doorContainer.addChild(doorOpenContainer)

const doorOpenShadow: PIXI.Sprite = PIXI.Sprite.from(doorOpenShadowImage)
doorOpenShadow.anchor.set(0.4, 0.47)
doorOpenContainer.addChild(doorOpenShadow)

const doorOpen: PIXI.Sprite = PIXI.Sprite.from(doorOpenImage)
doorOpen.anchor.set(0.5)
doorOpenContainer.visible = false
doorOpenContainer.addChild(doorOpen)

const blink1: PIXI.Sprite = PIXI.Sprite.from(blinkImage)
blink1.anchor.set(0.2, -0.15)

const blink2: PIXI.Sprite = PIXI.Sprite.from(blinkImage)
blink2.anchor.set(0.65, 0.55)

const blink3: PIXI.Sprite = PIXI.Sprite.from(blinkImage)
blink3.anchor.set(1.45, 0.55)

background.addChild(blink1)
background.addChild(blink2)
background.addChild(blink3)

const resizeElements = (): void => {
  background.x = app.screen.width / 2
  background.y = app.screen.height / 2

  const scaleX: number = app.screen.width / background.texture.width
  const scaleY: number = app.screen.height / background.texture.height
  const scale: number = Math.max(scaleX, scaleY)
  background.scale.set(scale)

  door.x = app.screen.width / 2 + 10
  door.y = app.screen.height / 2 - 8
  door.scale.set(scale)

  doorOpenContainer.x = app.screen.width / 2 + door.width / 1.4
  doorOpenContainer.y = app.screen.height / 2
  doorOpenContainer.scale.set(scale)
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

const showCombinationInConsole = (): void => {
  combination.forEach((step) => {
    console.log(`${Math.abs(step)} ${step > 0 ? 'clockwise' : 'counterclockwise'}`);
  })
}

showCombinationInConsole()

const checkInput = (): void => {
  const currentCombination: number = combination[userPosition];

  if (currentCombination === userStep) {
    console.log(`Position ${userPosition + 1} guessed correctly!`)
    userPosition++
    userStep = 0
    rotateHandle(-userStep)

    if (userPosition === combination.length) {
      openDoor()
      showMessage("win")
      console.log('Safe unlocked!');

      setTimeout(() => {
        closeDoor()
        resetGame()
      }, 5000)
      return
    }
    showMessage('correct')
  } else if (Math.abs(userStep) > 9) {
    resetGame()
    showMessage("lose")
  }
}

const showMessage = (mes: 'win' | 'lose' | 'correct'): void => {
  const ticker = new PIXI.Ticker()
  let scale: number = 0

  let messageText: string
  let messageColor: number

  if (mes === 'win') {
    messageText = 'CONGRATULATIONS!'
    messageColor = 0x176969;
  } else if (mes === 'lose') {
    messageText = 'YOU LOST :( TRY AGAIN'
    messageColor = 0x800020;
  } else if (mes === 'correct') {
    messageText = `YOU GUESSED POSITION ${userPosition}! KEEP GOING!`
    messageColor = 0x008000;
  }

  const message = new PIXI.Text({ text: messageText, style: {
    fontFamily: 'Geneva',
    fontSize: 50,
    fill: messageColor,
  }});

  message.x = (app.screen.width - message.width) / 2;
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

  setTimeout(() => {
    message.visible = false
  }, 3000)
}

const rotateHandle = (step: number): void => {
  console.log(step);
  const rotationAngle: number = step * (Math.PI / 3);
  gsap.to(handleContainer, {
    rotation: rotationAngle,
    duration: 0.5,
    ease: 'power2.out',
    onComplete: () => {
      checkInput()
    },
  })
}

const crazyRotateHandle = (): void => {
  gsap.to(handleContainer, {
    rotation: handleContainer.rotation + Math.PI * 10,
    duration: 2,
    ease: 'power4.out',
  })
}

const openDoor = (): void => {
  door.visible = false
  doorOpenContainer.visible = true
}

const closeDoor = (): void => {
  door.visible = true
  doorOpenContainer.visible = false
  crazyRotateHandle()
}

const resetGame = (): void => {
  userPosition = 0
  userStep = 0
  rotateHandle(-userStep)
  console.log('Combination reset. Start over.')
  combination = generateCombination()
  showCombinationInConsole()
};

const leftButton = document.getElementById('left-arrow')
const rightButton = document.getElementById('right-arrow')

leftButton.addEventListener('click', () => { 
  userStep -= baseStep;
  rotateHandle(userStep)
})

rightButton.addEventListener('click', () => { 
  userStep += baseStep;
  rotateHandle(userStep)
})

