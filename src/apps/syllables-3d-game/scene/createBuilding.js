import * as THREE from 'three';

/**
 * Creates a simple building model
 * @param {number} x - X position
 * @param {number} z - Z position
 * @returns {THREE.Mesh} - Building mesh
 */
export const createBuilding = (x, z) => {
  const height = 5 + Math.random() * 10;
  const width = 2 + Math.random() * 2;
  const depth = 2 + Math.random() * 2;

  const buildingGeometry = new THREE.BoxGeometry(width, height, depth);
  const buildingMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color().setHSL(Math.random(), 0.3, 0.5)
  });
  const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
  building.position.set(x, height / 2, z);
  building.castShadow = true;
  building.receiveShadow = true;

  return building;
};
