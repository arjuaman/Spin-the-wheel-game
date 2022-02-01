import {
  Application, Text, TextStyle, Container, Sprite, Texture, DEG_TO_RAD, BitmapText,
} from 'pixi.js';

import { gsap } from 'gsap';
import { preLoader } from './PreLoader';
import assets from './assets';
import { getTexture } from './Textures';

export class Game {
  private stage: Container;

  private readonly app: Application;

  private readonly game: Container;

  private readonly start: Container;

  private readonly end: Container;

  private isInitialized = false;

  private wheel: Sprite | undefined;

  private arrow: Sprite | undefined;

  private readonly jackpot: Container;

  private prizes = ['Zero :(', '100', '200', '500', '1000', '2000', 'JACKPOT!'];

  private segAngle = 360 / this.prizes.length;

  constructor(app: Application) {
    this.app = app;
    this.stage = app.stage;
    const centerX = app.view.width / 2;
    const centerY = app.view.height / 2;
    this.start = new Container();
    this.end = new Container();
    this.game = new Container();
    this.jackpot = new Container();
    this.stage.addChild(this.game, this.start, this.jackpot);
    this.game.visible = false;
    this.end.visible = false;
    this.jackpot.visible = false;

    const offset = 90;

    this.shuffle(this.prizes);

    const placex: number[] = [centerX - offset - 80, centerX + offset + 45, centerX - offset - 80, centerX + offset - 40, centerX - offset, centerX + offset, centerX - offset + 60];
    const placey: number[] = [centerY, centerY + 10, centerY - offset - 30, centerY + offset + 30, centerY + offset + 30, centerY - offset - 20, centerY - offset - 100];

    preLoader(assets, () => {
      this.isInitialized = true;
      for (let i = 0; i < this.prizes.length; i++) {
        this.createText(this.prizes[i], new TextStyle({
          fontSize: '20px',
          fontFamily: 'Comic Sans',
          fill: 'black',
          align: 'center'
        }), placex[i], placey[i]);
      }
      this.createStartText();
      this.wheel = this.createWheel(centerX, centerY);
      this.wheel.interactive = true;
      this.arrow = this.createArrow(centerX, centerY);

      this.wheel.on('click', () => {
        const prizeNum = Math.floor(Math.random() * this.prizes.length);
        const stopAngle = this.segAngle * prizeNum;
        if (this.wheel) {
          gsap.to(this.wheel, { rotation: DEG_TO_RAD * (3600 + stopAngle), duration: 4, ease: 'power2.easeOut' });
        }
        setInterval(() => {
          this.jackpot.visible = true;
        }, 4000)

        setInterval(() => {
          this.createWinText();
        }, 5000)
      });
      
    });

    console.warn(this.app);
  }

  private shuffle(array: any[]):any[] {
    var currentIndex = array.length, randomIndex;
    while (0 !== currentIndex) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }
    return array;
  }

  private createText(text: string, style: TextStyle, x: number, y: number): Text {
    const txt = new Text(text, style);
    txt.position.set(x, y);
    this.jackpot.addChild(txt);
    return txt;
  }

  private createArrow(centerX: number, centerY: number): Sprite {
    // 348 298
    this.arrow = new Sprite(getTexture('arrow') as Texture);
    this.arrow.anchor.set(0.5);
    this.arrow.scale.set(0.5);
    this.arrow.position.set(centerX / 3, centerY);
    this.game.addChild(this.arrow);
    console.log(this.arrow.x + " " + this.arrow.y);
    return this.arrow;
  }

  private createWheel(centerX: number, centerY: number): Sprite {
    //569 566
    this.wheel = new Sprite(getTexture('wheel') as Texture);
    this.wheel.anchor.set(0.5);
    this.wheel.position.set(centerX, centerY);
    this.game.addChild(this.wheel);
    return this.wheel;
  }

  private createStartText(): void {
    const title = new BitmapText('Spin the Wheel Game!', {
      fontName: 'Desyrel',
      fontSize: 69,
      align: 'center',
    });
    title.anchor.set(0.5);
    title.x = this.app.view.width / 2;
    title.y = title.height;

    const instructions = new BitmapText('Click anywhere on the wheel to try your luck!', {
      fontName: 'Desyrel',
      tint: 0xfff,
      fontSize: 25,
      align: 'center',
    });
    instructions.anchor.set(0.5);
    instructions.x = this.app.view.width / 2;
    instructions.y = title.height + 75;

    const start = new BitmapText('Start Game', {
      fontName: 'Desyrel',
      fontSize: 50,
      tint: 0xb82be2,
      align: 'center',
    });
    start.anchor.set(0.5);
    start.position.set(this.app.view.width / 2, this.app.view.height / 2);
    start.buttonMode = true;
    start.interactive = true;

    start.on('pointerup', () => {
      this.start.visible = false;
      this.game.visible = true;
      // this.jackpot.visible = true;
      this.stage.removeChild(this.start);
    });
    this.start.addChild(title, start, instructions);
  }

  private createWinText(): void {
    const title2 = new BitmapText('GAME OVER!!', {
      fontName: 'Desyrel',
      fontSize: 100,
      align: 'center',
    });
    title2.anchor.set(0.5);
    title2.x = this.app.view.width / 2;
    title2.y = title2.height;

    const gg = new BitmapText('You won: ' + this.prizes[0], {
      fontName: 'Desyrel',
      fontSize: 75,
      tint: 0xb82be2,
      align: 'center',
    });
    gg.anchor.set(0.5);
    gg.position.set(this.app.view.width / 2, this.app.view.height / 2);

    this.jackpot.visible = false;
    this.game.visible = false;
    // this.jackpot.visible = true;
    this.stage.removeChild(this.game, this.jackpot);
    this.end.visible = true;
    this.end.addChild(title2, gg);
    this.stage.addChild(this.end);
  }

  public update(delta: number): void {
    // eslint-disable-next-line no-empty
    delta;
    if (this.isInitialized && this.wheel) {
      // eslint-disable-next-line no-unused-expressions
      // this.wheel.rotation += delta * DEG_TO_RAD;
    }
  }
}
