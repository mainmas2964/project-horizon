import { system, world, Direction } from "@minecraft/server";

/**
 * Конфиг по умолчанию — настраивайте.
 * ttl, maxBounces и т.д. — в тиках (20 тиков = 1 сек).
 */
const DEFAULTS = {
  ttlTicks: 20 * 6, // 6 секунд
  maxBounces: 4,
  bounciness: 0.75, // коэффициент сохранения скорости после удара
  minSpeedToKeep: 0.08, // если скорость мала — убираем снаряд
  spawnOffset: 0.6, // насколько смещать снаряд от поверхности чтобы не застрял
  randomAngular: 0.12, // небольшая рандомизация направления
  homing: {
    enabled: true,
    chance: 0.6,
    radius: 6,
    strengthPerTick: 0.06,
    durationTicks: 20 * 3
  },
  projectileId: "horizon:basic_disk"
};

/* ------------- вспомогательные функции ------------- */

function faceToNormal(face) {
  // Direction enum: "Up","Down","North","South","East","West"
  switch (face) {
    case Direction.Up: return { x: 0, y: 1, z: 0 };
    case Direction.Down: return { x: 0, y: -1, z: 0 };
    case Direction.North: return { x: 0, y: 0, z: -1 };
    case Direction.South: return { x: 0, y: 0, z: 1 };
    case Direction.East: return { x: 1, y: 0, z: 0 };
    case Direction.West: return { x: -1, y: 0, z: 0 };
    default: return { x: 0, y: 1, z: 0 };
  }
}

function normalize(v) {
  const m = Math.hypot(v.x, v.y, v.z) || 1;
  return { x: v.x / m, y: v.y / m, z: v.z / m };
}
function mul(v, k) { return { x: v.x * k, y: v.y * k, z: v.z * k }; }
function add(a, b) { return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z }; }
function dot(a, b) { return a.x * b.x + a.y * b.y + a.z * b.z; }

/* отражение векторной скорости по нормали n */
function reflectVelocity(vel, n, bounciness = 0.8, randomAngular = 0.0) {
  const d = dot(vel, n);
  let r = {
    x: vel.x - 2 * d * n.x,
    y: vel.y - 2 * d * n.y,
    z: vel.z - 2 * d * n.z
  };

  // сохраним энергию через bounciness
  r = mul(r, bounciness);

  // небольшая случайность (spin)
  if (randomAngular > 0) {
    r.x += (Math.random() - 0.5) * randomAngular;
    r.y += (Math.random() - 0.5) * randomAngular;
    r.z += (Math.random() - 0.5) * randomAngular;
  }
  return r;
}

/* find homing target within radius (simple) */
function findHomingTarget(prj, radius, filter = e => true) {
  return prj.dimension.getEntities({
    location: prj.location,
    maxDistance: radius
  }).filter(e => filter(e)).shift(); // просто первый попавшийся
}

/* обновление тэга счётчика отскоков: возвращает новый count */
function bumpBounceTag(entity) {
  const tags = entity.getTags();
  const old = tags.find(t => t.startsWith("ric_bounces:"));
  let count = 0;
  if (old) {
    try { count = parseInt(old.split(":")[1] || "0"); } catch { count = 0; }
    // remove old tag
    try { entity.removeTag(old); } catch { /* ignore */ }
  }
  count++;
  try { entity.addTag(`ric_bounces:${count}`); } catch { /* ignore */ }
  return count;
}

/* удаление тэга (чистка) */
function clearBounceTag(entity) {
  entity.getTags().forEach(t => { if (t.startsWith("ric_bounces:")) { try { entity.removeTag(t); } catch { } } });
}

/* старт небольшого homing'а (применяем импульс в направлении цели каждый тик) */
function startHoming(prj, target, opts) {
  if (!prj || !target) return;
  const { strengthPerTick = 0.06, durationTicks = 20 * 3 } = opts;
  let ticks = 0;
  const handle = system.runInterval(() => {
    // если снаряд/цель мертвы — остановиться
    if (!prj.isValid || !target.isValid) { system.clearRun(handle); return; }
    // направление к цели
    const dir = normalize({ x: target.location.x - prj.location.x, y: target.location.y - prj.location.y, z: target.location.z - prj.location.z });
    // apply small impulse towards target
    prj.applyImpulse(mul(dir, strengthPerTick));
    ticks++;
    if (ticks > durationTicks) system.clearRun(handle);
  }, 1);
}

/* ------------- основной обработчик ------------- */

world.afterEvents.projectileHitBlock.subscribe(event => {
  try {
    const prj = event.projectile;
    if (!prj || prj.typeId !== DEFAULTS.projectileId) return;

    // берем расширенные данные по удару
    const blockHit = event.getBlockHit(); // BlockHitInformation
    const face = blockHit?.face ?? Direction.Up;
    const normal = faceToNormal(face);

    // текущая скорость снаряда
    const vel = prj.getVelocity();

    // если скорость почти нулевая — можно просто удалить
    const speed = Math.hypot(vel.x, vel.y, vel.z);
    if (speed < DEFAULTS.minSpeedToKeep) {
      try { prj.remove(); } catch { }
      return;
    }

    // вычисляем отражённую скорость
    const reflected = reflectVelocity(vel, normal, DEFAULTS.bounciness, DEFAULTS.randomAngular);

    // смещённая позиция чтобы не застрять в блоке
    const spawnPos = {
      x: prj.location.x + normal.x * DEFAULTS.spawnOffset,
      y: prj.location.y + normal.y * DEFAULTS.spawnOffset,
      z: prj.location.z + normal.z * DEFAULTS.spawnOffset
    };

    // системный счётчик отскоков
    const bounces = bumpBounceTag(prj);
    if (bounces > DEFAULTS.maxBounces) {
      try { prj.remove(); } catch { }
      return;
    }

    // ПОДХОД 1 (рекомендуемый): переиспользовать тот же Entity:
    try {
      prj.clearVelocity();
      prj.teleport(spawnPos, { checkForBlocks: true }); // безопасно смещаем
      prj.applyImpulse(reflected);
    } catch (e) {
      // на всякий случай — fallback: спавним новый (если тип summonable)
      try {
        const newPrj = prj.dimension.spawnEntity(DEFAULTS.projectileId, spawnPos);
        newPrj.applyImpulse(reflected);
        // копируем тэги (если нужно)
        newPrj.addTag(`ric_bounces:${bounces}`);
        prj.remove();
        // планируем удаление нового
        system.runTimeout(() => { try { newPrj.remove(); } catch { } }, DEFAULTS.ttlTicks);
      } catch (err) {
        // если всё упало — убираем старый
        try { prj.remove(); } catch { }
      }
      return;
    }

    // Опционально: homing — ищем цель и тянем снаряд к ней
    if (DEFAULTS.homing.enabled && Math.random() < DEFAULTS.homing.chance) {
      const target = findHomingTarget(prj, DEFAULTS.homing.radius, e => e.typeId !== DEFAULTS.projectileId && e.typeId !== prj.typeId);
      if (target) startHoming(prj, target, { strengthPerTick: DEFAULTS.homing.strengthPerTick, durationTicks: DEFAULTS.homing.durationTicks });
    }

    // TTL — чтобы снаряд не жил вечно
    system.runTimeout(() => {
      try {
        // перед удалением можно проиграть частицы/звук
        prj.remove();
      } catch { }
    }, DEFAULTS.ttlTicks);

  } catch (err) {
    // для безопасности — лог в консоле
    try { world.getDimension("overworld").runCommandAsync(`tellraw @a {"rawtext":[{"text":"Ricochet error: ${String(err).slice(0, 200)}"}]}`); } catch { }
  }
});
