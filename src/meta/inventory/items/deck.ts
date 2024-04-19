import { MonsterId } from "../../scenes/monsters/monsterdb"

/*
추가 Effect
- card의 spec을 상향시킨다.
- random하게 추가 카드를 사용할 수 있다. 
- 일꾼으로 활용가능하다.
- Player에게 debuff를 한다. 
*/
export type DeckId = string

export type DeckType = {
    id: DeckId
    title: string
    contents: string
    maxLv: number// 레벨업 한계
    minTime: number // 소환 가능한 최소 시간
    maxTime: number // 소환 가능한 최대 시간
    maxSpawn: number // 소환 가능한 몬스터 수
    monId: symbol
}

export class Deck {
    static DeckDb = new Map<DeckId, DeckType>()
    static Zombie: DeckType = {
        id: "zombie_deck",
        title: "전염된 좀비들",
        contents:`무덤에서 소환되는 좀비와 다르게 전염된 좀비는 인간이 사는 어느 곳이든 소환이 가능합니다.
        전염성이 매우 강하기 때문에 그 수가 순식간에 늘어납니다. 
        이 카드는 최대 30마리의 좀비를 소환할 수 있습니다.`,
        maxLv: 5,
        minTime: 0,
        maxTime: 10,
        maxSpawn: 30,
        monId: MonsterId.Zombie,
    }
    constructor() {
        Deck.DeckDb.set(Deck.Zombie.id, Deck.Zombie)
    }
}
/*
좀비군의 리더 - 어둠의 대가

카드 이름: 좀비군의 리더 - 어둠의 대가
카드 종류: 몬스터
속성: 어둠
레벨: 7
공격력: 2500
수비력: 2000

이 카드는 묘지에서만 소환할 수 있습니다. 
어둠의 대가는 좀비들의 지배자로, 어둠의 힘을 이용해 무덤 속에서 새로운 생명을 부여합니다. 
그의 출현은 모든 좀비들에게 희망을 주고, 적에게는 공포를 안겨 죽음을 예고합니다.

이 카드가 전투에 참여할 때, 상대 필드의 몬스터 1장을 파괴할 수 있습니다. 
이는 어둠의 대가가 좀비들을 이끌고 전쟁터로 나서 상대를 무찌르는 모습을 상징합니다. 
또한, 이 카드가 전투로 파괴될 경우, 묘지로부터 좀비 속성 몬스터 1장을 선택하여 소환할 수 있습니다. 
이는 어둠의 대가가 묘지에서 새로운 생명을 불어넣어 좀비들을 부활시키는 능력을 나타냅니다.
*/
