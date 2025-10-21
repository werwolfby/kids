import * as THREE from 'three';

/**
 * Creates a decorative rock
 * @param {number} x - X position
 * @param {number} z - Z position
 * @returns {THREE.Mesh} - Rock mesh
 */
export const createRock = (x, z) => {
  const rockGeometry = new THREE.DodecahedronGeometry(0.3 + Math.random() * 0.4, 0);
  const rockMaterial = new THREE.MeshStandardMaterial({ color: 0x808080 });
  const rock = new THREE.Mesh(rockGeometry, rockMaterial);
  rock.position.set(x, 0.2, z);
  rock.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
  rock.castShadow = true;
  return rock;
};
