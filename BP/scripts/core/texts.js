
// для происхождений
let originsLoc
let classLoc
let abilitiesLoc
originsLoc = {
    "en": {
        "predecessor": {
            description: "The predecessors are an ancient race that lives in caves and hid there during the beginning of the demon invasion. They are very good at excavation and possess forgotten technologies\n[ Abilities ]\n5 percent chance to get xp when mining\n70 percent chanceget xp when mining ore\nMining stone/ores faster\n[ Basic mining mobile workbench ]\nTorch\iron with coal",
            name: "Predecessor"
        },
        "bee": {
            description: "Apid - this race loves flowers, honey... and death! Although bee-like creatures are very fragile, they can poison their enemies (perhaps at the cost of their own lives)\n[ abilities ]\nyou will have 7 stingers, when you make a crit hit, you will consume 1 stinger, and you apply fatal poisoning to the enemy for a few seconds\n[ last hit ]\nif you use your last sting, you and the enemy will take 90 damage and be poisoned to death\nYou'll take more damage\nUsing the flower in your hand, you will restore 1 sting and regenerate some HP\n[ mobile bee workbench ]\nHoneycomb\nGolden honeycomb\nNectar collector\nHoney stinger sword\nHoney bottle",
            name: "Apid"
        },
        "demon": {
            description: "Demons – one of the strongest and most ferocious races.\n[ Eternal Fire Resistance ]\nYou don't burn in fire.\n[ Demonic Fury ]\n30% chance to gain Resistance when taking damage, also damages and ignites nearby enemies.\n[ Curse of Sleep ]\nYou cannot sleep.",
            name: "Demon"
        }
    },
    "ru": {
        "predecessor": {
            description: "Предшественники — это древняя раса, обитающая в пещерах, куда они скрылись в начале демонического вторжения. Они превосходны в раскопках и обладают забытыми технологиями\n[ Способности ]\nШанс 5 процентов получить опыт при добыче камня\nШанс 70 процентов получить опыт при добыче руды\nБолее быстрая добыча камня и руды\n[ Базовый мобильный верстак шахтёра ]\nФакел\nЖелезо с углем",
            name: "Предшественник"
        },
        "bee": {
            description: "Апид — эта раса обожает цветы, мёд... и смерть! Хотя пчелеобразные существа очень хрупкие, они могут отравить своих врагов (возможно, ценой собственной жизни)\n[ Способности ]\nУ вас будет 7 жал: при критическом ударе расходуется одно жало и накладывается смертельное отравление на врага на несколько секунд\n[ Последний удар ]\nЕсли вы используете своё последнее жало, вы и враг получите по 90 урона и будете смертельно отравлены\nВы будете получать больше урона\nЕсли держать и использовать цветок в руке, можно восстановить 1 жало и немного восстановить здоровье\n[ Мобильный пчелиный верстак ]\nМедовые соты\nЗолоте медовые соты\nСборщик нектара\nМедовый жало-меч\nБутылочка мёда",
            name: "Пчела"
        },
        "demon": {
            description: "Демоны - одна из самых сильных рас, и одна из самых яростных\n[ вечная огнестойкость ]\nВы не горите в огне\n[ Демоническая ярость ]\n с шансом в 30 процентов при получаний урона получить эффект Сопротивление , а так же нанести урон ближайшим врагам и поджечь их\n[ Проклятие сна ]\nВы не можете спать",
            name: "Демон"
        }
    }
}
abilitiesLoc = {
    "en": {
        "teleportation": {
            name: "Teleportation",
            description: "Teleportation - allows you to teleport at a distance, and perform teleport attacks requires lapis lazuli as energy\nHold the item in your hand and use it to teleport in the direction of your gaze(consumes a small amount of lapis lazuli)\nHold the item in your second hand, and the weapon in your first, and use the weapon while looking at the mob to perform a teleport attack \n(consumes lapis lazuli)"
        },
        "redstone_impulse": {
            name: "Redstone impulse",
            description: "Redstone impulse – a very powerful ability that must be used carefully\nElectric Charge\nWhen using the ability, 8 redstone dust is consumed, granting you a 10-unit charge\nIf there are redstone mechanisms or any blocks powered by redstone nearby, you gain more charge.\nWhen hitting mobs with any weapon, the amount of charge affects the damage dealt and creates a pulse.\nIf the pulse is strong enough, it may destroy nearby blocks.\nCharge consumption also scales with your current charge level – the more charge you have, the more is consumed."

        }
    },
    "ru": {
        "teleportation": {
            name: "Телепортация",
            description: "Телепортация - позволяет телепортироваться на дистанцию, и совершать телепорт-удары\nтребует лазурит в качестве энергий\nДержите предмет в руке и используйте его для телепортаций в сторону взгляда(тп удар без оружия не требует лазурит)\nДержите предмет во второй руке, а оружие в первой, и используйте оружие смотря на моба, чтобы применить телепорт удар \n(расходует лазурит)"
        },
        "redstone_impulse": {
            name: "Редстоун импульс",
            description: "Редстоун-импульс — это очень мощная способность, но пользоваться ею нужно осторожно\nЭлектрический заряд\nПри использовании способности у вас расходуется 8 единиц редстоун-пыли, и вы получаете заряд в 10 единиц.\nЕсли рядом с вами есть редстоун-механизмы или любые блоки, активированные редстоуном, вы получите больше заряда.\nПри ударе мобов любым оружием, в зависимости от количества заряда, вы нанесёте больше урона и создадите импульс, сила которого зависит от заряда. Если импульс достаточно мощный — возможно разрушение блоков.\nРасход заряда также зависит от текущего уровня заряда: чем он выше — тем больше тратится."
        }
    }
}
classLoc = {
    "en": {
        "redstone_engineer": {
            description: `Redstone engineers very good at redstone, as well as automation! \n\n§b[ Passive ] : \n\n§c[ Redstone powered ] \n\n§5if you using a Redstone block, you will get an a §ySpeed and strength §5 effect \n\n[ More redstone and components ]\n\n§rWith 60 percent chance you mine a more dust from Redstone ore \n\n§b[Mobile workbench T-REdst] \n\n§5Redstone components \n\nComponents for utilitycraft addon (experimental)\n[ Available abilities ]\nRedstone impulse:\n${abilitiesLoc["en"]["redstone_impulse"].description}`,
            name: "Redstone engineer"
        },
        "prospector": {
            name: "Prospector",
            description: "Prospectors – while they don't have strong abilities, they are great at surviving. \n[ Cookies fan ]\nWhen eating a cookie, you gain regeneration.\n[ More Health ]\nYou have more health.\n[ Basic Mobile Workbench ]\n[ All basic abilities available ]"

        },
        "mechanist": {
            name: "Mechanist",
            description: "mechanist"
        }
    },
    "ru": {
        "redstone_engineer": {
            name: "Редстоун инженер",
            description: `Инженеры редстоуна очень хороши в работе с редстоуном, а также в автоматизации! \n\n§b[ Пассивно ] : \n\n§c[ Питание от редстоуна ] \n\n§5Если вы используете блок редстоуна, вы получите эффект §yСкорости и Силы§5 \n\n[ Больше редстоуна и компонентов ]\n\n§rС вероятностью 60 процентов вы получите больше редстоуна из руды редстоуна \n\n§b[Мобильный верстак T-REdst] \n\n§5Редстоун-компоненты \n\nКомпоненты для аддона utilitycraft (экспериментально)\n[ Доступные способности ]\nРедстоун импульс:\n${abilitiesLoc["ru"]["redstone_impulse"].description}`
        },
        "prospector": {
            name: "Проходчик",
            description: "Проходчики - хоть и не имеют сильных способностей , однако они прекрасно справляются с выживанием \n[ Любитель печенья ]\nПри поедании печенья вы получаете регенерацию\n[ Больше жизней ]\nУ вас больше здоровья\n[ Базовый мобильный верстак ]\n[ Доступны все базовые способности ]"
        },
        "mechanist": {
            name: "Механист",
            description: "механист"
        }
    }
}

export { originsLoc, abilitiesLoc, classLoc }