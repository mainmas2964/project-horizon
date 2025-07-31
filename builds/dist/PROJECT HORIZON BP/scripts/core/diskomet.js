import { system, world } from "@minecraft/server";

// Вычисление нормали отражения
// Простая система отражения по hitVector
function reflectByHitVector(v, speed = 0.6, yBounce = 0.6) {
  const absX = Math.abs(v.x);
  const absY = Math.abs(v.y);
  const absZ = Math.abs(v.z);
  const r = { x: 0, y: 0, z: 0 };

  if (absY >= absX && absY >= absZ) {
    r.y = yBounce - 0.1;
    r.x = -v.x * 0.8 + (Math.random() * 0.5);
    r.z = - v.z * 0.8 + (Math.random() * 0.5);
    r.y *= yBounce;
  } else if (absX >= absZ) {
    r.x = v.x > 0 ? -speed : speed;
    r.y = yBounce
  } else {
    r.z = v.z > 0 ? -speed : speed;
    r.y = yBounce
  }

  return r;
}

function directionTo(from, to) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const dz = to.z - from.z;
  const mag = Math.hypot(dx, dy, dz) || 1;
  return { x: dx / mag, y: dy / mag, z: dz / mag };
}



export function reflectProjectile(prj, hitVector, options = {}) {
  const {
    ttl = 60,
    despawnChance = 0,
    projectileId = "horizon:basic_disk",
    speed = 0.6,
    yBounce = 0.6,
    seekChance = 0.0,
    seekRadius = 6,
    targetFilter = (e) =>
      e.typeId !== projectileId && e.typeId !== prj.typeId
  } = options;

  if (Math.random() < despawnChance) {
    prj.remove();
    return;
  }
  let reflected = reflectByHitVector(hitVector, speed, yBounce);

  if (Math.random() < seekChance) {
    const nearby = prj.dimension.getEntities({
      location: prj.location,
      maxDistance: seekRadius
    }).filter(targetFilter);

    if (nearby.length > 0) {
      const target = nearby[Math.floor(Math.random() * nearby.length)];
      const dir = directionTo(prj.location, target.location);
      const mag = Math.hypot(reflected.x, reflected.y, reflected.z);
      reflected = { x: dir.x * mag, y: dir.y * mag, z: dir.z * mag };
    }
  }

  const spawnPos = {
    x: Math.floor(prj.location.x + -hitVector.x) + 0.5,
    y: Math.floor(prj.location.y + -hitVector.y) + 0.3,
    z: Math.floor(prj.location.z + -hitVector.z) + 0.5
  };

  const newPrj = prj.dimension.spawnEntity(projectileId, spawnPos);

  newPrj.applyImpulse(reflected);
  prj.remove()

  system.runTimeout(() => {
    try {
      newPrj.remove();
    }
    catch { }
  }, ttl);
}

// 
world.afterEvents.projectileHitBlock.subscribe(event => {
  const prj = event.projectile;

  if (prj.typeId === "horizon:basic_disk") {
    reflectProjectile(prj, event.hitVector, {
      ttl: 100,
      despawnChance: 0.2,
      speed: 1.0,
      yBounce: 0.3,
      seekChance: 0.8,
      seekRadius: 6
    });
  }
});
