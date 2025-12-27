import { world, system, ItemStack, ItemEnchantableComponent } from "@minecraft/server"
import { addAction } from "core/utilities/core_utilities.js"

const RedstoneOres = ["minecraft:redstone_ore", "minecraft:deepslate_redstone_ore"]

const FlowerIDs = [
    "minecraft:dandelion", "minecraft:poppy", "minecraft:blue_orchid", "minecraft:allium",
    "minecraft:azure_bluet", "minecraft:red_tulip", "minecraft:orange_tulip", "minecraft:white_tulip",
    "minecraft:pink_tulip", "minecraft:oxeye_daisy", "minecraft:cornflower", "minecraft:lily_of_the_valley",
    "minecraft:sunflower", "minecraft:rose_bush", "minecraft:peony", "minecraft:lilac", "minecraft:wither_rose"
];

const RawMeatIDs = [
    "minecraft:beef", "minecraft:chicken", "minecraft:porkchop", "minecraft:mutton",
    "minecraft:rabbit", "minecraft:cod", "minecraft:salmon", "minecraft:tropical_fish",
    "minecraft:pufferfish", "minecraft:rotten_flesh", "minecraft:spider_eye"
];

const stoneKeywords = ["stone", "cobble", "granite", "andesite", "diorite", "deepslate"];

const BeeSneakMap = new Map();

const UseItemFunctionsMap = {}

const UseItemCompleteFunctionsMap = {
    "prospector": (data => {
        if (data.itemStack.typeId != "minecraft:cookie") return;
        data.source.addEffect("regeneration", 100, { amplifier: 2 })
    }),
    "bee_origin": (data => {
        if (data.itemStack.typeId != "minecraft:honey_bottle" && data.itemStack.typeId != "nectar_bottle") return;
        data.source.addEffect("regeneration", 100, { amplifier: 2 })
    }),
    "slimecat": (data => {
        const itemId = data.itemStack.typeId;
        if (RawMeatIDs.includes(itemId)) {
            data.source.removeEffect("poison");
            data.source.removeEffect("fatal_poison");
            data.source.addEffect("saturation", 10, { amplifier: 1 });
        }
        else if (!itemId.includes("potion") && !itemId.includes("milk") && !itemId.includes("bottle")) {
            data.source.addEffect("poison", 200, { amplifier: 1 });
        }
    })
}

const HitEntityPlMap = {
    "bee_origin": (data => {
        if (data.damagingEntity.getVelocity().y > -0.1 || data.hitEntity.getEffect("fatal_poison")) return;
        let stingers = data.damagingEntity.getDynamicProperty("stingers")
        if (stingers > 0) {
            addAction(data.damagingEntity, `§l§6[ ${stingers - 1} (-1) ]`)
            data.hitEntity.addEffect("fatal_poison", 150, { amplifier: 2 });
            data.damagingEntity.setDynamicProperty("stingers", stingers - 1)
            if ((stingers - 1) > 0) return;
            data.damagingEntity.addTag("nostingers")
            data.hitEntity.applyDamage(90);
            data.damagingEntity.applyDamage(90)
            processEffects(data.damagingEntity, "nostingers")
        }
        else {
            addAction(data.damagingEntity, `§l§6[0! ]`)
        }
    }),
    "redstone_engineer": (data => {
        const energy = data.damagingEntity.getDynamicProperty("charge")
        if (energy - (10 + energy * 0.3) < 0) return;
        const { x, y, z } = data.hitEntity.location
        data.hitEntity.applyDamage(1 + energy * 0.03)
        data.hitEntity.applyImpulse(data.damagingEntity.getViewDirection())
        system.run(() => {
            data.damagingEntity.dimension.spawnParticle("horizon:explosion_strong", { x, y, z })
            data.damagingEntity.dimension.playSound("horizon:impulse_strange", { x, y, z })
            data.damagingEntity.dimension.playSound("horizon:explode_lighting", { x, y, z })
        })
        data.damagingEntity.setDynamicProperty("charge", Math.floor(energy - (10 + energy * 0.05)))
        addAction(data.damagingEntity, `${Math.floor(energy - (10 + energy * 0.05))}(-${Math.floor((10 + energy * 0.05))})`)
    })
}

const BreakBlockFunctionsMap = {
    "engineer_level_r": (data => {
        if (Math.random() > 0.90) return;
        if (!RedstoneOres.includes(data.block.typeId)) return;
        const redstone = new ItemStack("minecraft:redstone", 10)
        system.run(() => {
            data.block.dimension.spawnItem(redstone, data.block)
        })
    }),
    "predecessor": (data => {
        const blcl = classifyBlock(data.block.typeId)
        if (blcl != "other" && !data.itemStack?.getComponent(ItemEnchantableComponent.componentId)?.getEnchantment("silk_touch")) {
            if (blcl === "stone" && Math.random() < 0.01) {
                system.run(() => {
                    data.block.dimension.spawnEntity("minecraft:xp_orb", data.block.center())
                })
            }
            else if (blcl === "ore" && Math.random() < 0.3) {
                system.run(() => {
                    data.block.dimension.spawnEntity("minecraft:xp_orb", data.block.center())
                })
            }
        }
    })
}

const InteractFunctionsMap = {
    "demon": (data => {
        if (data.block.typeId != "minecraft:bed") return;
        data.cancel = true;
    })
}

const EntityHurtFunctionsMap = {
    "weak_hp": (data => {
        data.hurtEntity.applyDamage(2)
    }),
    "demon": (data => {
        if (Math.random() > 0.30) return;
        data.hurtEntity.addEffect("resistance", 150)
        const entities = data.hurtEntity.dimension.getEntities({ location: data.hurtEntity.location, maxDistance: 4 })
        for (const key of entities) {
            if (key.id === data.hurtEntity.id) continue;
            key.setOnFire(5);
            key.applyDamage(5);
        }
    })
}

const PlayerButtonInputFunctionsMap = {
    "slimecat": (data => {
        if (data.button !== "Jump" || data.newButtonState !== "Pressed") return;

        const player = data.player;
        const vel = player.getVelocity();
        const view = player.getViewDirection();

        let isGrounded = false;
        const offsets = [
            { x: 0, y: -0.1, z: 0 }, { x: -0.3, y: -0.1, z: -0.3 }, { x: 0.3, y: -0.1, z: 0.3 },
            { x: -0.3, y: -0.1, z: 0.3 }, { x: 0.3, y: -0.1, z: -0.3 }
        ];

        for (const offset of offsets) {
            const block = player.dimension.getBlock({
                x: player.location.x + offset.x,
                y: player.location.y + offset.y,
                z: player.location.z + offset.z
            });
            if (block && !block.isAir) {
                isGrounded = true;
                break;
            }
        }

        if (isGrounded) {
            player.addTag("can_double_jump");
        }
        else if (player.hasTag("can_double_jump")) {
            player.removeTag("can_double_jump");

            const strength = 1.2;
            const vertical = 0.6;
            player.applyKnockback({ x: view.x * strength, z: view.z * strength }, vertical)

            player.playSound("mob.slime.jump");
            player.dimension.spawnParticle("minecraft:slime_particle", player.location);
        }
    }),
    "bee_origin": (data => {
        if (data.button === "Sneak") {
            const playerId = data.player.id;

            if (data.newButtonState === "Pressed") {
                if (BeeSneakMap.has(playerId)) return;

                const runId = system.runInterval(() => {
                    const player = data.player;

                    if (!player.isValid || !player.isSneaking) {
                        system.clearRun(runId);
                        BeeSneakMap.delete(playerId);
                        player.setDynamicProperty("bee_timer", 0);
                        return;
                    }

                    const blockAtFeet = player.dimension.getBlock(player.location);

                    if (FlowerIDs.includes(blockAtFeet.typeId)) {
                        let timer = player.getDynamicProperty("bee_timer") || 0;
                        timer++;
                        player.setDynamicProperty("bee_timer", timer);

                        if (timer % 5 === 0) {
                            addAction(player, `§6Pollinating... ${Math.floor((timer / 60) * 100)}%`);
                        }

                        if (timer >= 60) {
                            player.setDynamicProperty("bee_timer", 0);

                            const inventory = player.getComponent("minecraft:inventory").container;
                            const mainHand = inventory.getItem(player.selectedSlotIndex);

                            if (mainHand && mainHand.typeId === "minecraft:glass_bottle") {
                                if (mainHand.amount > 1) {
                                    mainHand.amount -= 1;
                                    inventory.setItem(player.selectedSlotIndex, mainHand);
                                } else {
                                    inventory.setItem(player.selectedSlotIndex, undefined);
                                }

                                const nectar = new ItemStack("horizon:pollen_bottle", 1);
                                const leftover = inventory.addItem(nectar);
                                if (leftover) {
                                    player.dimension.spawnItem(leftover, player.location);
                                }

                                addAction(player, "§6§l+ Pollen Bottle");
                                player.playSound("bucket.fill_lava");
                                blockAtFeet.setType("air")
                            }
                            else {
                                let stingers = player.getDynamicProperty("stingers") || 0;
                                if (stingers < 7) {
                                    player.setDynamicProperty("stingers", stingers + 1);
                                    addAction(player, `§l§6 ${stingers + 1} (+1)`);
                                    try { player.removeTag("nostingers") } catch { }
                                } else {
                                    addAction(player, "§l§6 Max Stingers");
                                }
                                player.addEffect("regeneration", 100, { amplifier: 0 });
                                player.playSound("block.beehive.enter");
                                blockAtFeet.setType("air")
                            }
                        }
                    } else {
                        player.setDynamicProperty("bee_timer", 0);
                        addAction(player, "");
                    }
                }, 1);

                BeeSneakMap.set(playerId, runId);

            } else {
                const runId = BeeSneakMap.get(playerId);
                if (runId) {
                    system.clearRun(runId);
                    BeeSneakMap.delete(playerId);
                    data.player.setDynamicProperty("bee_timer", 0);
                }
            }
        }
    })
}

function classifyBlock(typeId) {
    const id = typeId.toLowerCase();
    if (stoneKeywords.some(k => id.includes(k))) return "stone";
    if (id.includes("ore")) return "ore";
    return "other";
}

function dispatchByTag(entity, map, event) {
    try {
        for (const tag of entity.getTags()) {
            const func = map[tag];
            if (func) func(event);
        }
    }
    catch {
    }
}

world.beforeEvents.playerBreakBlock.subscribe(event => { dispatchByTag(event.player, BreakBlockFunctionsMap, event); })
world.afterEvents.itemUse.subscribe(e => dispatchByTag(e.source, UseItemFunctionsMap, e));
world.afterEvents.itemCompleteUse.subscribe(e => { dispatchByTag(e.source, UseItemCompleteFunctionsMap, e) })
world.afterEvents.entityHitEntity.subscribe(e => { dispatchByTag(e.damagingEntity, HitEntityPlMap, e) })
world.beforeEvents.playerInteractWithBlock.subscribe(event => { dispatchByTag(event.player, InteractFunctionsMap, event) })
world.afterEvents.entityHurt.subscribe(e => { dispatchByTag(e.hurtEntity, EntityHurtFunctionsMap, e) })
world.afterEvents.playerButtonInput.subscribe(e => { dispatchByTag(e.player, PlayerButtonInputFunctionsMap, e) })