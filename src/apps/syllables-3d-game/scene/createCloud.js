import * as THREE from 'three';

/**
 * Creates a cloud made of spheres
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {number} z - Z position
 * @returns {THREE.Group} - Cloud group object
 */
export const createCloud = (x, y, z) => {
  const cloudGroup = new THREE.Group();
  const cloudMaterial = new THREE.MeshStandardMaterial({
    color: 0xFFFFFF,
    transparent: true,
    opacity: 0.8
  });

  // Cloud made of 5 spheres
  for (let i = 0; i < 5; i++) {
    const size = 1 + Math.random() * 1.5;
    const sphere = new THREE.Mesh(
      new THREE.SphereGeometry(size, 6, 6),
      cloudMaterial
    );
    sphere.position.x = (Math.random() - 0.5) * 4;
    sphere.position.y = (Math.random() - 0.5) * 1;
    sphere.position.z = (Math.random() - 0.5) * 2;
    cloudGroup.add(sphere);
  }

  cloudGroup.position.set(x, y, z);
  return cloudGroup;
};
