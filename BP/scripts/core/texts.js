// для происхождений
let originsLoc
let classLoc
let abilitiesLoc
originsLoc = {
    "en": {
        "predecessor": {
            description: "The predecessors are an ancient race that lives in caves and hid there during the beginning of the demon invasion. They are very good at excavation and possess forgotten technologies\n§b[ Abilities ]\n§a5 percent chance to get xp when mining stone\n§a70 percent chance to get xp when mining ore\n§aMining stone/ores faster\n§b[ Basic mining mobile workbench ]\n§fTorch\n§fIron with coal",
            name: "§9Predecessor"

        },
        "bee": {
            description: "Apid - this race loves flowers, honey... and death! Although bee-like creatures are very fragile, they can poison their enemies (perhaps at the cost of their own lives)\n§6[ Abilities ]\n§eYou will have 7 stingers. When you make a critical hit, you will consume 1 stinger and apply fatal poisoning to the enemy for a few seconds.\n§6[ Last Hit ]\n§cIf you use your last stinger, you and the enemy will take 90 damage and be fatally poisoned.\n§cYou'll take more damage.\n§6[ Pollen Collecting ]\n§aStand still on a flower while Sneaking for 3 seconds to recover 1 stinger and regenerate HP, OR use an empty Glass Bottle to craft a Nectar Bottle.\n§6[ Mobile Bee Workbench ]\n§fHoneycomb\n§fGolden honeycomb\n§fPollen collector\n§fHoney stinger sword\n§fHoney bottle",
            name: "§6Apid"
        },
        "demon": {
            description: "Demons – one of the strongest and most ferocious races.\n§4[ Eternal Fire Resistance ]\n§cYou don't burn in fire.\n§4[ Demonic Fury ]\n§c30% chance to gain Resistance when taking damage, also damages and ignites nearby enemies.\n§4[ Curse of Sleep ]\n§cYou cannot sleep.",
            name: "§4Demon"
        },
        "slimecat": {
            name: "§aSlimecat",
            description: "§a[ Enhanced Agility ]\n§fAllows for a double jump by consuming the 'double jump' charge upon jumping in the air. Charge is restored upon landing.\n§a[ Dietary Restrictions ]\n§fYou can only safely consume raw meat (Raw Beef, Rotten Flesh, etc.) to gain saturation\n§cConsuming any other type of food (cooked, bread, etc.) will inflict Poison",
        },
        "robot": {
            name: "§3Robot",
            description: "§3[ Basic Features ]\n§fDetails about the Robot race."
        },
        "sculkborned": {
            name: "§2Sculkborned",
            dscription: "§2[ Basic Features ]\n§fDetails about the Sculkborned race."
        }
    },
    "ru": {
        "predecessor": {
            description: "Предшественники — это древняя раса, обитающая в пещерах, куда они скрылись в начале демонического вторжения. Они превосходны в раскопках и обладают забытыми технологиями\n§b[ Способности ]\n§aШанс 5 процентов получить опыт при добыче камня\n§aШанс 70 процентов получить опыт при добыче руды\n§aБолее быстрая добыча камня и руды\n§b[ Базовый мобильный верстак шахтёра ]\n§fФакел\n§fЖелезо с углем",
            name: "§9Предшественник"
        },
        "bee": {
            description: "Апид — эта раса обожает цветы, мёд... и смерть! Хотя пчелеобразные существа очень хрупкие, они могут отравить своих врагов (возможно, ценой собственной жизни)\n§6[ Способности ]\n§eУ вас будет 7 жал: при критическом ударе расходуется одно жало и накладывается смертельное отравление на врага на несколько секунд\n§6[ Последний удар ]\n§cЕсли вы используете своё последнее жало, вы и враг получите по 90 урона и будете смертельно отравлены\n§cВы будете получать больше урона\n§6[ Сбор Нектара ]\n§aСтойте на цветке, приседая (Sneak), в течение 3 секунд, чтобы восстановить 1 жало и немного HP, ИЛИ используйте пустую Стеклянную Бутылку, чтобы получить Бутылку Нектара.\n§6[ Мобильный пчелиный верстак ]\n§fМедовые соты\n§fЗолотые медовые соты\n§fСборщик нектара\n§fМедовый жало-меч\n§fБутылочка мёда",
            name: "§6Пчела"
        },
        "demon": {
            description: "Демоны - одна из самых сильных рас, и одна из самых яростных\n§4[ Вечная огнестойкость ]\n§cВы не горите в огне\n§4[ Демоническая ярость ]\n§cС шансом в 30 процентов при получении урона получить эффект Сопротивление, а также нанести урон ближайшим врагам и поджечь их\n§4[ Проклятие сна ]\n§cВы не можете спать",
            name: "§4Демон"
        },
        "slimecat": {
            name: "§aСлаймкот",
            description: "§a[ Улучшенная Ловкость ]\n§fДоступен двойной прыжок при расходе заряда после прыжка в воздухе. Заряд восстанавливается при приземлении.\n§a[ Ограничения в Питании ]\n§fВы можете безопасно есть только сырое мясо (Сырая говядина, Гнилая плоть и т.п.), чтобы получить Насыщение\n§cПоедание любой другой пищи (жареной, хлеба и т.п.) наложит на вас Отравление.",
        }
        ,
        "robot": {
            name: "§3Робот",
            description: "§3[ Базовые Особенности ]\n§fИнформация о расе Робот."
        },
        "sculkborned": {
            name: "§2Скалкорожденный",
            dscription: "§2[ Базовые Особенности ]\n§fИнформация о расе Скалкорожденный."
        }
    }
}
abilitiesLoc = {
    "en": {
        "teleportation": {
            name: "§bTeleportation",
            description: "§bTeleportation §f- allows you to teleport at a distance, and perform teleport attacks requires lapis lazuli as energy\n§aHold the item in your hand and use it to teleport in the direction of your gaze (§econsumes a small amount of lapis lazuli)\n§aHold the item in your second hand, and the weapon in your first, and use the weapon while looking at the mob to perform a teleport attack \n(§econsumes lapis lazuli)"
        },
        "redstone_impulse": {
            name: "§cRedstone impulse",
            description: "§cRedstone impulse §f– a very powerful ability that must be used carefully\n§4Electric Charge\n§fWhen using the ability, 8 redstone dust is consumed, granting you a 10-unit charge\n§fIf there are redstone mechanisms or any blocks powered by redstone nearby, you gain more charge.\n§fWhen hitting mobs with any weapon, the amount of charge affects the damage dealt and creates a pulse.\n§fIf the pulse is strong enough, it may destroy nearby blocks.\n§fCharge consumption also scales with your current charge level – the more charge you have, the more is consumed."

        },
        "drone_station_t1": {
            name: "§3Drone-station t1",
            description: "§3[ Basic Features ]\n§fDetails about Drone-station t1."
        },
        "builder_wand": {
            name: "Builder wand",
            desciption: ""
        }
    },
    "ru": {
        "teleportation": {
            name: "§bТелепортация",
            description: "§bТелепортация §f- позволяет телепортироваться на дистанцию, и совершать телепорт-удары\n§fтребует лазурит в качестве энергий\n§aДержите предмет в руке и используйте его для телепортаций в сторону взгляда (§eтп удар без оружия не требует лазурит)\n§aДержите предмет во второй руке, а оружие в первой, и используйте оружие смотря на моба, чтобы применить телепорт удар \n(§eрасходует лазурит)"
        },
        "redstone_impulse": {
            name: "§cРедстоун импульс",
            description: "§cРедстоун-импульс §f— это очень мощная способность, но пользоваться ею нужно осторожно\n§4Электрический заряд\n§fПри использовании способности у вас расходуется 8 единиц редстоун-пыли, и вы получаете заряд в 10 единиц.\n§fЕсли рядом с вами есть редстоун-механизмы или любые блоки, активированные редстоуном, вы получите больше заряда.\n§fПри ударе мобов любым оружием, в зависимости от количества заряда, вы нанесёте больше урона и создадите импульс, сила которого зависит от заряда. Если импульс достаточно мощный — возможно разрушение блоков.\n§fРасход заряда также зависит от текущего уровня заряда: чем он выше — тем больше тратится."
        },
        "drone_station_t1": {
            name: "§3Дрон-станция Т1",
            description: "§fЗа 12 редстоуна позволяет заспавнить не более 2 гибридных паукоботов Т1\n§fПри спавне третьего паукобота, самый старый паукобот исчезает\n§fПозволяет ремонтировать союзных юнитов роботов"
        },
        "builder_wand": {
            name: "Строительный посох",
            description: ""
        }
    }
}
classLoc = {
    "en": {
        "redstone_engineer": {
            description: `§cRedstone engineers §fvery good at redstone, as well as automation! \n\n§b[ Passive ] : \n\n§4[ Redstone powered ] \n\n§fIf you use a Redstone block, you will get a §eyears and strength §feffect \n\n§b[ More redstone and components ]\n\n§fWith 60 percent chance you mine more dust from Redstone ore \n\n§b[Mobile workbench T-REdst] \n\n§5Redstone components \n\n§fComponents for utilitycraft addon (experimental)\n§b[ Available abilities ]\n§cRedstone impulse:\n${abilitiesLoc["en"]["redstone_impulse"].description}`,
            name: "§cRedstone engineer"
        },
        "prospector": {
            name: "§eProspector",
            description: "§eProspectors §f– while they don't have strong abilities, they are great at surviving. \n§6[ Cookies fan ]\n§fWhen eating a cookie, you gain regeneration.\n§6[ More Health ]\n§fYou have more health.\n§6[ Basic Mobile Workbench ]\n§f[ All basic abilities available ]"

        },
        "mechanist": {
            name: "§3Mechanist",
            description: `§3Mechanist §f- engineer class who can make noise without being on the battlefield!\n§b[ Features ]\n§fYou get more redstone from redstone ore\n§f+30 percent to spidermine durability\n§b[ Mobile workbench T2 ]\n§5Robospheres\n§5Crafting components\n§5Industrial equipment (Utilitycraft required)\n§b[ Available abilities ]\n§3Drone-station T1\n${abilitiesLoc["en"]["drone_station_t1"].description}`
        },
        "builder": {
            name: "§aBuilder",
            description: "§aBuilder §f- a class that loves to build large buildings\n§6[ Building staff ]\n§fWhen choosing a class, you get a building staff\n§fWhen using the staff on any block, it enters the selection area\n§fWhen creating a second point..."
        },
        "mage": {},
        "farmer": {},
        "researcher": {}
    },
    "ru": {
        "redstone_engineer": {
            name: "§cРедстоун инженер",
            description: `§cИнженеры редстоуна §fочень хороши в работе с редстоуном, а также в автоматизации! \n\n§b[ Больше редстоуна и компонентов ]\n\n§fС вероятностью 60 процентов вы получите больше редстоуна из руды редстоуна \n\n§b[Мобильный верстак T-REdst] \n\n§5Редстоун-компоненты \n\n§fКомпоненты для аддона utilitycraft (экспериментально)\n§b[ Доступные способности ]\n§cРедстоун импульс:\n${abilitiesLoc["ru"]["redstone_impulse"].description}`
        },
        "prospector": {
            name: "§eПроходчик",
            description: "§eПроходчики §f- хоть и не имеют сильных способностей, однако они прекрасно справляются с выживанием \n§6[ Любитель печенья ]\n§fПри поедании печенья вы получаете регенерацию\n§6[ Больше жизней ]\n§fУ вас больше здоровья\n§6[ Базовый мобильный верстак ]\n§f[ Доступны все базовые способности ]"
        },
        "mechanist": {
            name: "§3Механист",
            description: `§3Механист §f- инженерный класс, который может наделать шуму даже не находясь на поле боя!\n§b[ Особенности ]\n§fВы получаете больше редстоуна с редстоун руды\n§f+30 процентов к прочности паукомин\n§b[ Мобильный верстак Т2 ]\n§5Робосферы\n§5Компоненты для крафта\n§5Индустриальное оборудование (необходим Utilitycraft)\n§b[ Доступные способности ]\n§3Дрон-станция Т1\n${abilitiesLoc["ru"]["drone_station_t1"].description}`
        },
        "builder": {
            name: "§aСтроитель",
            description: "§aСтроитель §f- класс который любит строить большие здания\n§6[ Строительный посох ]\n§fпри выборе класса у вас появляеться строительный посох\n§fПри использований посоха на любом блоке он попадает в зону выделения\n§fпри созданий второй то"
        }
    }
}

export { originsLoc, abilitiesLoc, classLoc }