import * as THREE from 'three';

/**
 * Creates a decorative flower
 * @param {number} x - X position
 * @param {number} z - Z position
 * @returns {THREE.Group} - Flower group
 */
export const createFlower = (x, z) => {
  const flowerGroup = new THREE.Group();

  // Stem
  const stemGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.3, 4);
  const stemMaterial = new THREE.MeshStandardMaterial({ color: 0x228B22 });
  const stem = new THREE.Mesh(stemGeometry, stemMaterial);
  stem.position.y = 0.15;
  flowerGroup.add(stem);

  // Flower head
  const petalColors = [0xFF69B4, 0xFFFF00, 0xFF6347, 0xFF00FF, 0x00BFFF];
  const color = petalColors[Math.floor(Math.random() * petalColors.length)];
  const headGeometry = new THREE.SphereGeometry(0.1, 6, 6);
  const headMaterial = new THREE.MeshStandardMaterial({ color: color });
  const head = new THREE.Mesh(headGeometry, headMaterial);
  head.position.y = 0.35;
  flowerGroup.add(head);

  flowerGroup.position.set(x, 0, z);
  return flowerGroup;
};
