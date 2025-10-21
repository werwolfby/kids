import * as THREE from 'three';

/**
 * Creates a tree model with trunk and foliage
 * @param {number} x - X position
 * @param {number} z - Z position
 * @returns {THREE.Group} - Tree group object
 */
export const createTree = (x, z) => {
  const treeGroup = new THREE.Group();

  // Tree trunk
  const trunkGeometry = new THREE.CylinderGeometry(0.3, 0.4, 2, 6);
  const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
  const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
  trunk.position.y = 1;
  trunk.castShadow = true;
  treeGroup.add(trunk);

  // Tree foliage (3 spheres)
  const foliageGeometry = new THREE.SphereGeometry(1.2, 6, 6);
  const foliageMaterial = new THREE.MeshStandardMaterial({ color: 0x228B22 });

  const foliage1 = new THREE.Mesh(foliageGeometry, foliageMaterial);
  foliage1.position.y = 2.5;
  foliage1.castShadow = true;
  treeGroup.add(foliage1);

  const foliage2 = new THREE.Mesh(foliageGeometry, foliageMaterial);
  foliage2.position.y = 3.5;
  foliage2.scale.set(0.8, 0.8, 0.8);
  foliage2.castShadow = true;
  treeGroup.add(foliage2);

  const foliage3 = new THREE.Mesh(foliageGeometry, foliageMaterial);
  foliage3.position.y = 4.3;
  foliage3.scale.set(0.5, 0.5, 0.5);
  foliage3.castShadow = true;
  treeGroup.add(foliage3);

  treeGroup.position.set(x, 0, z);
  return treeGroup;
};
