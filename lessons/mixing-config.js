window.DECODER_MIXING = {
  "count": 10,
  "sequence": ["listen", "meaning", "speak", "segment", "listen", "meaning", "segment", "speak", "listen", "meaning"],
  "wordGroups": [
    {"lesson":1,"pair":[1,2],"words":["起床","看书","睡觉","左右"]},
    {"lesson":1,"pair":[1,3],"words":["回家","做饭"]},
    {"lesson":1,"pair":[1,4],"words":["上班","下班"]},
    {"lesson":2,"pair":[1,2],"words":["周末","休息","运动","公园","电影"]},
    {"lesson":2,"pair":[2,3],"words":["朋友","一起"]},
    {"lesson":2,"pair":[2,4],"words":["喜欢"]},
    {"lesson":3,"pair":[1,3],"words":["菜单","点菜","推荐","招牌菜","口味","清淡","打包","买单"]},
    {"lesson":3,"pair":[3,4],"words":["一份","一碗","够"]},
    {"lesson":4,"pair":[3,4],"words":["多少钱","折扣","我要这个"]},
    {"lesson":4,"pair":[2,4],"words":["颜色","黑色","白色"]},
    {"lesson":4,"pair":[1,4],"words":["衣服","试一下","小码","中码","大码","合适","大一点","小一点"]}
  ],
  "segments": [
    {"lesson":1,"pair":[1,2]}, {"lesson":2,"pair":[1,2]},
    {"lesson":3,"pair":[1,3]}, {"lesson":4,"pair":[1,4]}
  ],
  "pairs": [
    {"lessons":[1,2],"weight":5,"tasks":[
      {"kind":"card","eyebrow":"L1 + L2","title":"看书 → 看电影","body":"看 revient dans plusieurs expressions. Lis les deux sans pinyin, puis dis laquelle correspond à ton week-end."},
      {"kind":"speak","q":"周末你一般几点起床？","hint":"我周末一般 ____ 点左右起床。"}
    ]},
    {"lessons":[2,3],"weight":5,"tasks":[
      {"kind":"speak","q":"周末你跟朋友一起吃饭吗？","hint":"周末我跟朋友一起 ______。"},
      {"kind":"card","eyebrow":"L2 + L3","title":"朋友 + 一起 + 吃饭","body":"Réutilise les blocs connus : 跟朋友一起 + 吃饭 / 喝咖啡 / 看电影。"}
    ]},
    {"lessons":[1,3],"weight":3.2,"tasks":[
      {"kind":"speak","q":"回家以后，你做饭吗？","hint":"回家以后，我 ______。"},
      {"kind":"card","eyebrow":"L1 + L3","title":"做饭 → 点菜","body":"À la maison, 做饭 ; au restaurant, 点菜. Compare les deux situations."}
    ]},
    {"lessons":[3,4],"weight":5,"tasks":[
      {"kind":"card","eyebrow":"L3 + L4","title":"一份菜 · 一碗米饭 · 一件衣服","body":"Observe le classificateur qui change avec le nom : 份 / 碗 / 件."},
      {"kind":"speak","q":"买衣服以后，你想吃什么？","hint":"买衣服以后，我想吃 ______。"}
    ]},
    {"lessons":[2,4],"weight":3.8,"tasks":[
      {"kind":"speak","q":"你喜欢什么颜色？","hint":"我喜欢 ______ 色。"},
      {"kind":"card","eyebrow":"L2 + L4","title":"喜欢 + 颜色","body":"Leçon 2 : 喜欢看电影. Leçon 4 : 喜欢黑色. Réutilise 喜欢 avec une action ou une chose."}
    ]},
    {"lessons":[1,4],"weight":3,"tasks":[
      {"kind":"speak","q":"下班以后，你去买衣服吗？","hint":"下班以后，我 ______。"},
      {"kind":"card","eyebrow":"L1 + L4","title":"下班以后 → 买衣服","body":"Réutilise 以后 pour enchaîner une action de la journée avec une situation d’achat."}
    ]}
  ]
};
