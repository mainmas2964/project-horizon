import { world, system } from "@minecraft/server";

world.afterEvents.playerJoin.subscribe(eventData => {
    system.runTimeout(() => {
        world.getDimension('overworld').runCommand(
            `execute as @a at @s unless entity @s[tag=prhrst] run give @s horizon:scroll_of_oc`
        );
        world.getDimension('overworld').runCommand(
            `execute as @a at @s unless entity @s[tag=prhrst] run give @s horizon:abilities_tablet`
        );
        world.getDimension('overworld').runCommand(
            `execute as @a at @s unless entity @s[tag=prhrst] run give @s horizon:mobile_workbench`
        );
        world.getDimension('overworld').runCommand(
            `execute as @a at @s unless entity @s[tag=prhrst] run tag @s add prhrst`
        );

        system.runTimeout(() => {
            world.getDimension('overworld').runCommand(
                `execute as @a at @s unless entity @s[tag=prhrst] run give @s horizon:scroll_of_oc`
            );
            world.getDimension('overworld').runCommand(
                `execute as @a at @s unless entity @s[tag=prhrst] run give @s horizon:abilities_tablet`
            );
            world.getDimension('overworld').runCommand(
                `execute as @a at @s unless entity @s[tag=prhrst] run give @s horizon:mobile_workbench`
            );
            world.getDimension('overworld').runCommand(
                `execute as @a at @s unless entity @s[tag=prhrst] run tag @s add prhrst`
            );
        }, 250);
    }, 100);
});
