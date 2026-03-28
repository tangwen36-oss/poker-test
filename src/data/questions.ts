export const questions = [
  {
    id: 1,
    players: "6人桌",
    stack: "100BB",
    position: "按钮位 BTN",
    cards: [{ rank: "A", suit: "♠", color: "text-slate-800" }, { rank: "J", suit: "♠", color: "text-slate-800" }],
    communityCards: [],
    scenario: "枪口位(UTG)平时打得挺稳，开局直接加注到 5BB，前面全部弃牌，轮到你",
    options: [
      { text: "平跟 5BB(Call)", scores: { TAG: 1 } },
      { text: "加注到 15BB(3-Bet)", scores: { LAG: 1 } },
      { text: "加注到 25BB(大尺度3-Bet)", scores: { LAG_FISH: 1 } },
      { text: "弃牌(Fold)", scores: { NIT: 1 } },
    ]
  },
  {
    id: 2,
    players: "6人桌",
    stack: "100BB",
    position: "中位 MP",
    cards: [{ rank: "K", suit: "♣", color: "text-slate-800" }, { rank: "Q", suit: "♣", color: "text-slate-800" }],
    communityCards: [
      { rank: "Q", suit: "♦", color: "text-red-500" },
      { rank: "7", suit: "♠", color: "text-slate-800" },
      { rank: "2", suit: "♣", color: "text-slate-800" }
    ],
    scenario: "你翻前加注到 5BB，大盲跟注，翻后大盲位过牌Check，轮到你",
    options: [
      { text: "下注 4BB(小注控制)", scores: { TAG: 1 } },
      { text: "下注 8BB(中大注施压)", scores: { LAG: 1 } },
      { text: "过牌(Check)", scores: { NIT: 1 } },
      { text: "延迟下注(Check 后准备转牌进攻)", scores: { CALLING: 1, LAG: 1 } },
    ]
  },
  {
    id: 3,
    players: "6人桌",
    stack: "100BB",
    position: "小盲位 SB",
    cards: [{ rank: "K", suit: "♥", color: "text-red-500" }, { rank: "7", suit: "♠", color: "text-slate-800" }],
    communityCards: [],
    scenario: "你刚被按钮位(BTN)在上轮河牌爆冷清空，这手牌他加注到5BB，轮到你",
    options: [
      { text: "弃牌(Fold)", scores: { TAG: 1 } },
      { text: "平跟 5BB(Call)", scores: { CALLING: 1 } },
      { text: "加注到 20BB(3bet)", scores: { TILT: 1 } },
      { text: "加注到 35BB(大尺度3bet)", scores: { LAG_FISH: 1 } },
    ]
  },
  {
    id: 4,
    players: "6人桌",
    stack: "100BB",
    position: "大盲位 BB",
    cards: [{ rank: "9", suit: "♠", color: "text-slate-800" }, { rank: "9", suit: "♥", color: "text-red-500" }],
    communityCards: [],
    scenario: "按钮位(BTN)加注到 5BB ，小盲弃牌，轮到你。",
    options: [
      { text: "补 4BB 跟注(Call)", scores: { TAG: 1 } },
      { text: "加注到 18BB (3-Bet)", scores: { LAG: 1 } },
      { text: "弃牌(Fold)", scores: { NIT: 1 } },
      { text: "全下 100BB (All-in)", scores: { LAG_FISH: 1 } },
    ]
  },
  {
    id: 5,
    players: "6人桌",
    stack: "100BB",
    position: "关卡位 CO",
    cards: [{ rank: "A", suit: "♦", color: "text-red-500" }, { rank: "5", suit: "♦", color: "text-red-500" }],
    communityCards: [],
    scenario: "前面的人全弃牌了，后面的盲注位是两个比较紧的形象，轮到你。",
    options: [
      { text: "补1BB跟住 (Call)", scores: { CALLING: 1 } },
      { text: "加注到 5BB", scores: { TAG: 1 } },
      { text: "加注到 8BB", scores: { LAG: 1 } },
      { text: "弃牌(Fold)", scores: { NIT: 1 } },
    ]
  },
  {
    id: 6,
    players: "6人桌",
    stack: "100BB",
    position: "UTG+1",
    cards: [{ rank: "J", suit: "♣", color: "text-slate-800" }, { rank: "T", suit: "♣", color: "text-slate-800" }],
    communityCards: [],
    scenario: "你今晚牌运极差，已经“水下”三个买入了。前置枪口位弃牌，轮到你。",
    options: [
      { text: "平跟1BB(Call)", scores: { CALLING: 1 } },
      { text: "加注 5BB(Raise)", scores: { TAG: 1 } },
      { text: "加注 12BB (大尺度Raise)", scores: { TILT: 1 } },
      { text: "弃牌(Fold)", scores: { NIT: 1 } },
    ]
  },
  {
    id: 7,
    players: "6人桌",
    stack: "100BB",
    position: "按钮位 BTN",
    cards: [{ rank: "A", suit: "♣", color: "text-slate-800" }, { rank: "Q", suit: "♣", color: "text-slate-800" }],
    communityCards: [
      { rank: "Q", suit: "♥", color: "text-red-500" },
      { rank: "J", suit: "♠", color: "text-slate-800" },
      { rank: "9", suit: "♠", color: "text-slate-800" },
      { rank: "8", suit: "♦", color: "text-red-500" },
      { rank: "2", suit: "♣", color: "text-slate-800" }
    ],
    scenario: "这手牌底池50BB，你中了顶对，对手在最后河牌扔出50BB满池下注。",
    options: [
      { text: "弃牌(Fold)", scores: { TAG: 1 } },
      { text: "跟注50BB看牌(Call)", scores: { CALLING: 1 } },
      { text: "全下100BB 施压 (All-in)", scores: { LAG_FISH: 1 } },
    ]
  },
  {
    id: 8,
    players: "6人桌",
    stack: "100BB",
    position: "线下自我画像",
    cards: [],
    communityCards: [],
    scenario: "抛开具体的牌局，你在熟人局里的画风更接近？",
    options: [
      { text: "重在参与，更愿意看到翻牌再做决定", scores: { CALLING: 1 } },
      { text: "入池范围较紧，更愿意等待明确优势再出手", scores: { NIT: 1 } },
      { text: "注重位置与节奏，进攻与放弃都很明确", scores: { TAG: 1 } },
      { text: "主动制造压力，愿意用更宽范围参与底池", scores: { LAG: 1 } },
    ]
  }
];
