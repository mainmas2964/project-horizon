
import { addAction } from "core/utilities/core_utilities.js"
import { world, system, HudElement, HudVisibility } from "@minecraft/server"
import { TickTaskScheduler } from "core/tickSystem/tick.js"
const scheduler = new TickTaskScheduler({ maxTasksPerTick: 5, saveKey: "123", metaKey: "12345" })
scheduler.registerTaskFactory("display_robot_charge", (data, resolveTarget) => {
    return (target) => {
        const player = target;
        if (!player) return true;
        if (!player?.hasTag("robot")) return false;
        let charge = player.getDynamicProperty("charge") ?? 100;
        addAction(player, `${player.getDynamicProperty("charge") ?? 0}`);
        player.onScreenDisplay.setHudVisibility(HudVisibility.Hide, [HudElement.Hunger])
        if (!target.isInWater || charge === 0) return true;
        player.setDynamicProperty("charge", charge - 1);
        addAction(player, `${charge - 1} (-1)`);
        player.applyDamage(5)

        return true;

    };
});

scheduler.registerTaskFactory("robot_charge_consume", (data, resolveTarget) => {
    return (target) => {
        const player = target;
        if (!player) return true;
        let charge = player.getDynamicProperty("charge") ?? 100;
        if (!player?.hasTag("robot")) return false
        if (charge <= 0) {
            player.addEffect("slowness", 1000, { amplifier: 1, showParticles: false });
            player.addEffect("weakness", 1000, { amplifier: 1, showParticles: false });
            addAction(player, `you have 0 energy!`);
        } else {
            player.setDynamicProperty("charge", charge - 1);
            addAction(player, `${charge - 1} (-1)`);
        }

        return true;
    };
});
scheduler.registerTaskFactory("ability_new_count", (data, resolveTarget) => {
    return (target) => {

    }
})

function startPermanentTextRobot(player, repeat = 20) {
    scheduler.addTask(null, {
        type: "display_robot_charge",
        data: { id: player.id },
        repeat: 5,
        customId: `perm_text_${player.id}`,
        replace: true,
        persist: true,
        target: player
    });
}


const applyObjectives = {
    "robot": (player => {
        scheduler.addTask(null, {
            type: "robot_charge_consume",
            data: { id: player.id },
            repeat: 1000,
            customId: `robot_charge_consume_${player.id}`,
            replace: true,
            persist: true,
            delay: 1,
            target: player
        });
        startPermanentTextRobot(player, 20)


    })
}
export function onApply(applyData, player) {
    const func = applyObjectives[applyData]
    if (func) func(player)
}

scheduler.loadTasks()

world.afterEvents.playerJoin.subscribe(data => {
    const player = world.getEntity(data.playerId)
    onApply(applyObjectives, player)
})
scheduler.registerTaskFactory("applyTaskCommand", (data, resolveTarget) => {
    return (target) => {
        if (!target.hasTag(data.tag)) return false
        target.dimension.runCommand(data.command)
        target.dimension.addEffect(data.effect)
        return true;
    }
})

