import { _decorator, Label, Component, Node, Input, input, EventKeyboard, KeyCode, Prefab, instantiate, director, Director, AudioClip, AudioSource, Collider2D, Contact2DType, IPhysics2DContact, game, Vec2, Button} from 'cc';
const { ccclass, property } = _decorator;

/*
1.重开和退出游戏
*/

@ccclass('GameRoot')
export class GameRoot extends Component {
    @property(Node) player: Node;
    @property(Node) chickensRoot: Node;
    @property(Node) eggsRoot: Node;
    @property(Prefab) eggPrefab: Prefab; 
    @property(AudioClip) bgmClip: AudioClip = null;
    @property(Label) label: Label;
    @property(Node) endGame: Node;
    @property(Button) restartButton:Button;
    @property(Button) exitButton:Button;
    _audioSource: AudioSource = null;
    _gap = 2;
    _speed = 1;
    _time = 0;

    playerPosIndex = 2;
    chickensPosXArr = [];
    score = 0;
    hp = 2.5;

    start() {
        this.initData();
        this.openInputEvent();
        this.schedule(this.startOneEgg, 2);
        this.openCoillider2DEvent();
        this.initBgm();
        this.bindRestartEvent();
        this.bindExitEvent();
    }

    update(deltaTime: number) {
        for(let i = 0;i < this.eggsRoot.children.length; i++){
            const egg = this.eggsRoot.children[i];
            const x = egg.position.x;
            const y = egg.position.y - (150 * deltaTime * this._speed);
            egg.setPosition(x, y);

            if(y < -600){
                egg.destroy();
                this.hp -= 0.5;
                this.renderLabel();
                this.checkGameOver();
            }
        }

        this._time += deltaTime;
        if(this._time > 5)
        {
            if(this._gap >= 0.6)
            {
                this._gap -= 0.2;
                this._speed += 0.5;
                this.startCreateEggs(this._gap);
            }
            this._time = 0;
        }
    }

    initData(){
        for(let i = 0;i< this.chickensRoot.children.length; i++){
            const chicken = this.chickensRoot.children[i];
            this.chickensPosXArr[i] = chicken.position.x;
        }
        this.renderPlayerPos();
        this.renderLabel();
    }

    initBgm() {
        if (this.bgmClip) {
            this._audioSource = new AudioSource();
            this._audioSource.clip = this.bgmClip;
            this._audioSource.loop = true;
            this._audioSource.play();
        }
    }

    startCreateEggs(gap: number){
        this.unschedule(this.startOneEgg);
        this.schedule(this.startOneEgg, gap);
    }

    startOneEgg(){
        const randomIndex = Math.floor(Math.random() * 5);
        const egg = instantiate(this.eggPrefab);
        this.eggsRoot.addChild(egg);
        egg.setPosition(this.chickensPosXArr[randomIndex], this.chickensRoot.position.y);
    }

    openInputEvent()
    {
        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
    }

    openCoillider2DEvent(){
        const comp = this.player.getComponent(Collider2D);
        comp.on(Contact2DType.BEGIN_CONTACT, (selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) => {
            director.once(Director.EVENT_AFTER_PHYSICS, () => {
                otherCollider.node.destroy();
            }, this);
            this.score += 1;
            this.renderLabel();
        }, this);
    }

    onKeyDown(event: EventKeyboard){
        switch(event.keyCode){
            case KeyCode.KEY_A:
                this.movePlayer(-1);
                break;
            case KeyCode.KEY_D:
                this.movePlayer(1);
                break;                
        }
    }

    movePlayer(dir: 1|-1 ){
        this.playerPosIndex = (this.playerPosIndex + dir + 5) % 5;
        this.renderPlayerPos();

    }

    renderPlayerPos(){
        const x = this.chickensPosXArr[this.playerPosIndex];
        const y = this.player.position.y;

        this.player.setPosition(x, y);
    }

    renderLabel(){
        this.label.string = `score:${this.score} | hp:${this.hp}`;
    }

    checkGameOver(){
        if(this.hp < 0.1)
        {
            this.endGame.setPosition(0,0);
            this._audioSource.stop();
            director.pause();  // 暂停游戏循环
            input.off(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        }
    }

    bindRestartEvent(){
        this.restartButton.node.on(Node.EventType.TOUCH_END, () => {
            director.resume();
            director.loadScene("jntm");
          });
    }
    
    bindExitEvent(){
        this.exitButton.node.on(Node.EventType.TOUCH_END, () => {
            director.end();
        });
    }
}