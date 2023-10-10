import { _decorator, Component, Node, SpriteFrame } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('CardManager')
export class CardManager extends Component {

    @property([SpriteFrame]) cardsSF: SpriteFrame[] = [];

    getCardSFById(id: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12){
        return this.cardsSF[id];
    }

    getCardBeiSF(){
        return this.cardsSF[12];
    }
}


