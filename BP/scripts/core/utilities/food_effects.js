import * as server from "@minecraft/server";

server.world.afterEvents.itemCompleteUse.subscribe(result => {

    let itemStack = result.itemStack;

    const badEffects = ["bad_omen", "blindness", "fatal_poison", "hunger", "instant_damage", "mining_fatigue", "nausea", "poison", "slowness", "weakness", "wither", "darkness"]
    const allEffects = server.EffectTypes.getAll().map(effect => effect.getName());
    let items = [
        { effect: "regeneration", duration: 15, amplifier: 1, itemTypeId: "horizon:health_mix_bottle" },
        { effect: "regeneration", duration: 15, amplifier: 1, itemTypeId: "horizon:golden_honeycomb" },
        { effect: "speed", duration: 45, amplifier: 2, itemTypeId: "horizon:golden_honeycomb" }
    ];
    for (let item of items) {
        if (itemStack.typeId === item.itemTypeId) {
            let effect = item.effect;
            let duration = item.duration;
            let amplifier = item.amplifier;

            if (item.weight) {
                let weight = item.weight;
                let random = Math.random() * 100;
                if (random < weight) {
                    result.source.addEffect(effect, duration * 20, { amplifier: amplifier });
                }
            } else {
                if (!item.remove) result.source.addEffect(effect, duration * 20, { amplifier: amplifier });
            }

            if (item.remove) {
                item.effect.forEach(effect => {
                    result.source.removeEffect(effect);
                })
            }
        }
    }
});