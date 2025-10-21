import * as THREE from 'three';

/**
 * Creates a mountain with snow cap
 * @param {number} x - X position
 * @param {number} z - Z position
 * @returns {THREE.Mesh} - Mountain mesh
 */
export const createMountain = (x, z) => {
  const mountainGeometry = new THREE.ConeGeometry(
    3 + Math.random() * 4,
    8 + Math.random() * 8,
    4
  );
  const mountainMaterial = new THREE.MeshStandardMaterial({
    color: 0x666666,
    flatShading: true
  });
  const mountain = new THREE.Mesh(mountainGeometry, mountainMaterial);
  mountain.position.set(x, 0, z);
  mountain.castShadow = false;
  mountain.receiveShadow = false;

  // Add snow cap
  const snowGeometry = new THREE.ConeGeometry(
    (3 + Math.random() * 4) * 0.6,
    (8 + Math.random() * 8) * 0.4,
    4
  );
  const snowMaterial = new THREE.MeshStandardMaterial({
    color: 0xFFFFFF,
    flatShading: true
  });
  const snow = new THREE.Mesh(snowGeometry, snowMaterial);
  snow.position.y = mountain.geometry.parameters.height * 0.6;
  mountain.add(snow);

  return mountain;
};
