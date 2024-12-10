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
handleShadow.x = 30
handleShadow.y = 35

// handleShadow.anchor.set(0.62, 0.47)
handleContainer.addChild(handleShadow)

const handle: PIXI.Sprite = PIXI.Sprite.from(handleImage)
handle.width = 677
handle.height = 748
// handle.anchor.set(0.63, 0.52)

handleContainer.addChild(handle)

handleContainer.pivot.set(handle.width / 2, handle.height / 2)
handleContainer.x = -90
// handleContainer.position.set(handle.x + handle.width / 2, handle.y + handle.height / 2);

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


  doorOpenContainer.x = app.screen.width / 2 + door.width / 1.4
  doorOpenContainer.y = app.screen.height / 2
  doorOpenContainer.scale.set(scale)

  // doorOpen.x = app.screen.width / 2 + 460
  // doorOpen.y = app.screen.height / 2
  // doorOpen.scale.set(scale)

  // doorOpenShadow.x = app.screen.width / 2 + 460
  // doorOpenShadow.y = app.screen.height / 2
  // doorOpenShadow.scale.set(scale)
}

// let isDoorOpened = false

const openDoor = () => {
  // isDoorOpened = true
  door.visible = false
  doorOpenContainer.visible = true
}

const closeDoor = () => {
  door.visible = true
  doorOpenContainer.visible = false
  crazyRotateHandle()
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

const rotateHandle = (step: number): void => {
  console.log(step);
  const rotationAngle = step * (Math.PI / 3);
  gsap.to(handleContainer, {
    rotation: rotationAngle,
    duration: 0.5,
    // duration: 0.4 + 0.05 * Math.abs(step),
    // yoyo: true,
    ease: 'power2.out',
    onComplete: () => {
      checkInput();
    },
  });
}

const crazyRotateHandle = (): void => {
  gsap.to(handleContainer, {
    rotation: handleContainer.rotation + Math.PI * 10,
    duration: 2,
    ease: 'power4.out',
  });
};

const checkInput = () => {
  const currentCombination = combination[userPosition];

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
};


const showMessage = (mes: string): void => {
  const ticker = new PIXI.Ticker()
  let scale: number = 0

  let messageText: string;
  let messageColor: number;

  if (mes === 'win') {
    messageText = 'CONGRATULATIONS!'
    messageColor = 0x176969;
  } else if (mes === 'lose') {
    messageText = 'TRY AGAIN'
    messageColor = 0x800020;
  } else if (mes === 'correct') {
    messageText = 'GOOD JOB! KEEP GOING!'
    messageColor = 0x008000;
  }

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

  setTimeout(() => {
    message.visible = false
  }, 3000)
};


const resetGame = () => {
  userPosition = 0
  // userStep = 0
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

