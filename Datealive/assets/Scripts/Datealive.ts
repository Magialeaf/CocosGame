import { _decorator, Component, Node, Sprite, UITransform,Vec3,tween, sp, EventTouch, AudioClip, AudioSource, Label, director, Button } from 'cc';
import { CardManager } from './CardManager';
const { ccclass, property } = _decorator;

@ccclass('Datealive')
export class Datealive extends Component {
    @property(CardManager) cardManager:CardManager;
    @property(Node) pointRoot:Node;
    @property(AudioClip) bgmClip:AudioClip;
    @property(Label) stepLabel:Label;
    @property(Node) endGame: Node;
    @property(Label) endGameTip:Label;
    @property(Button) restartButton:Button;
    @property(Button) exitButton:Button;

    _audioSource:AudioSource;

    cards = [];
    step = 0;
    sum: number = 0;
    nextCard:boolean = true;

    currentOpenCard = {
        node: null,
        data: -1,
    }

    async start() {
        this.initCards();
        this.initBgm();
        await this.moveAllCards();
        await this.setCardBeiAnim();
        this.addCardsEvent();
        this.bindRestartEvent();
        this.bindExitEvent();
    }

   setCardBeiAnim(){
    return new Promise<void>(resolve => {
    this.node.children.forEach((node ,index) =>{
                // 卡牌翻转到背面
                tween(node)
                    .to(0.3, {scale: new Vec3(0, 0.6, 1)})
                    .call(() => {
                        const sprite = node.getComponent(Sprite);
                        sprite.spriteFrame = this.cardManager.getCardBeiSF();
                    })
                    .to(0.3, { scale: new Vec3(0.28, 0.6, 1)})
                    .start();
            });
            this.scheduleOnce(() => {
                resolve();
            }, 1);
        });
   }

    initCards(){
        for(let i = 0;i < 12;i++){
            this.cards.push(i);
            this.cards.push(i);
            this.sum += 2;       
        }

        for(let i = 0;i < 5;i++){
            this.cards.sort(() => 0.5 - Math.random());
        }

        this.cards.forEach(cardId => { this.createOneCard(cardId); });

        console.log(this.cards);
    }

    initBgm() {
        if (this.bgmClip) {
            this._audioSource = new AudioSource();
            this._audioSource.clip = this.bgmClip;
            this._audioSource.volume = 0.5;
            this._audioSource.loop = true;
            this._audioSource.play();
        }
    }

    createOneCard(id){
        const node = new Node('card');
        this.node.addChild(node);
        const tran = node.addComponent(UITransform);
        const sprite = node.addComponent(Sprite);
        sprite.sizeMode = Sprite.SizeMode.CUSTOM;
        tran.setContentSize(408,234);
        node.setScale(0.28,0.6);

        const sf = this.cardManager.getCardSFById(id);
        sprite.spriteFrame = sf;
    }

    moveAllCards(){
        return new Promise<void>(resolve => {
            this.node.children.forEach((node, index) => {
                const posX = this.pointRoot.children[index].position.x;
                const posY = this.pointRoot.children[index].position.y;
                
                tween(node).delay(index * 0.1).to(0.3, { position: new Vec3(posX,posY,0)  }).start();
            });
        this.scheduleOnce(() => {
            resolve();
        }, 3);
    })
    }

    addCardsEvent(){
        this.node.children.forEach((node, index) => {
                node.on(Node.EventType.TOUCH_END, async (event: EventTouch) => {
                    if(node == this.currentOpenCard.node || this.nextCard == false)
                    {
                        return;
                    }
                    this.nextCard = false;
                    this.step += 1;
                    this.renderLabel();
                    if(!this.currentOpenCard.node)
                    {
                        // 卡牌翻转到正面
                        const id = this.cards[index];
                        this.makeCardTurn(node ,false, id);
                        this.currentOpenCard.node = node;
                        this.currentOpenCard.data = id;
                        this.nextCard = true;
                    }
                    else
                    {
                        const id = this.cards[index];

                        if(this.currentOpenCard.data === id)
                        {
                            await this.makeCardTurn(node, false, id);
                            this.currentOpenCard.node.active = false;
                            this.currentOpenCard.node = null;
                            node.active = false;
                            this.sum -= 2;
                            this.checkGameOver();
                        }
                        else
                        {
                            await this.makeCardTurn(node ,false, id);
                            this.makeCardTurn(node, true);
                            await this.makeCardTurn(this.currentOpenCard.node, true);
                            this.currentOpenCard.node = null;

                        }
                        this.nextCard = true;
                    }
            }, this);
        })
    }

    makeCardTurn(node, isBack, id?){
        return new Promise<void>(resolve => {
            tween(node)
            .to(0.3, {scale: new Vec3(0, 0.8, 1)})
            .call(() => {
                const sprite = node.getComponent(Sprite);
                sprite.spriteFrame = isBack ? this.cardManager.getCardBeiSF() : this.cardManager.getCardSFById(id);
            })
            .to(0.3, { scale: new Vec3(0.28 ,0.6 ,1)} )
            .call(() => resolve())
            .start();
        });
    }

    renderLabel(){
        this.stepLabel.string = `Step：${this.step}`;
    }

    checkGameOver(){
        if(this.sum == 0)
        {
            this.endGame.setPosition(0,0);
            this._audioSource.stop();
            this.changeGameOverTip();
            director.pause();  // 暂停游戏循环
        }
    }

    changeGameOverTip(){
        if(this.step == 24)
            { console.log(1);this.endGameTip.string = "居然只用了22步，哥哥的记忆力真是惊为天人！"; }
        else if(this.step >= 25 && this.step <= 45)
            { console.log(2);this.endGameTip.string = "嘛，这个水平也算是个正常人了。"; }
        else if(this.step >= 46 && this.step <= 65)
            { console.log(3);this.endGameTip.string = "蛤，哥哥就这点水平吗？真是不行呢"; }
        else if(this.step > 65)
            { console.log(4);this.endGameTip.string = "杂鱼~杂鱼~，哥哥真是条杂鱼喵~"; }
    }

    bindRestartEvent(){
        this.restartButton.node.on(Node.EventType.TOUCH_END, () => {
            director.resume();
            director.loadScene("Datealive");
          });
    }
    
    bindExitEvent(){
        this.exitButton.node.on(Node.EventType.TOUCH_END, () => {
            director.end();
        });
    }

}


