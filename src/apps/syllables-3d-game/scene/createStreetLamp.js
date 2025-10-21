import * as THREE from 'three';

/**
 * Creates a street lamp
 * @param {number} x - X position
 * @param {number} z - Z position
 * @returns {THREE.Group} - Street lamp group
 */
export const createStreetLamp = (x, z) => {
  const lampGroup = new THREE.Group();

  // Pole
  const poleGeometry = new THREE.CylinderGeometry(0.1, 0.1, 4, 6);
  const poleMaterial = new THREE.MeshStandardMaterial({ color: 0x444444 });
  const pole = new THREE.Mesh(poleGeometry, poleMaterial);
  pole.position.y = 2;
  pole.castShadow = true;
  lampGroup.add(pole);

  // Lamp head
  const lampHeadGeometry = new THREE.BoxGeometry(0.4, 0.3, 0.4);
  const lampHeadMaterial = new THREE.MeshStandardMaterial({
    color: 0xFFFF88,
    emissive: 0xFFFF00,
    emissiveIntensity: 0.5
  });
  const lampHead = new THREE.Mesh(lampHeadGeometry, lampHeadMaterial);
  lampHead.position.y = 4.2;
  lampGroup.add(lampHead);

  lampGroup.position.set(x, 0, z);
  return lampGroup;
};
