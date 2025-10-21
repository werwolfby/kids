import * as THREE from 'three';

/**
 * Creates an animated bird
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {number} z - Z position
 * @returns {THREE.Group} - Bird group with animation data
 */
export const createBird = (x, y, z) => {
  const birdGroup = new THREE.Group();

  // Simple bird shape made of triangles
  const wingMaterial = new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.DoubleSide });

  // Left wing
  const leftWingGeometry = new THREE.BufferGeometry();
  const leftWingVertices = new Float32Array([
    0, 0, 0,
    -0.3, 0, 0.2,
    0, 0, 0.1
  ]);
  leftWingGeometry.setAttribute('position', new THREE.BufferAttribute(leftWingVertices, 3));
  const leftWing = new THREE.Mesh(leftWingGeometry, wingMaterial);
  birdGroup.add(leftWing);

  // Right wing
  const rightWingGeometry = new THREE.BufferGeometry();
  const rightWingVertices = new Float32Array([
    0, 0, 0,
    0.3, 0, 0.2,
    0, 0, 0.1
  ]);
  rightWingGeometry.setAttribute('position', new THREE.BufferAttribute(rightWingVertices, 3));
  const rightWing = new THREE.Mesh(rightWingGeometry, wingMaterial);
  birdGroup.add(rightWing);

  birdGroup.position.set(x, y, z);

  // Store animation and movement data
  birdGroup.userData.wingAngle = 0;
  birdGroup.userData.leftWing = leftWing;
  birdGroup.userData.rightWing = rightWing;
  birdGroup.userData.speed = 0.02 + Math.random() * 0.02;
  birdGroup.userData.orbitRadius = 10 + Math.random() * 20;
  birdGroup.userData.orbitAngle = Math.random() * Math.PI * 2;
  birdGroup.userData.orbitCenterX = x;
  birdGroup.userData.orbitCenterZ = z;

  return birdGroup;
};

/**
 * Animates a bird's wings and movement
 * @param {THREE.Group} bird - The bird object
 */
export const animateBird = (bird) => {
  // Wing flapping
  bird.userData.wingAngle += 0.15;
  const flapAngle = Math.sin(bird.userData.wingAngle) * 0.5;

  bird.userData.leftWing.rotation.y = flapAngle;
  bird.userData.rightWing.rotation.y = -flapAngle;

  // Circular flight path
  bird.userData.orbitAngle += bird.userData.speed;
  const relativeX = Math.cos(bird.userData.orbitAngle) * bird.userData.orbitRadius;
  const relativeZ = Math.sin(bird.userData.orbitAngle) * bird.userData.orbitRadius;

  bird.position.x = bird.userData.orbitCenterX + relativeX;
  bird.position.z = bird.userData.orbitCenterZ + relativeZ;

  // Face the direction of movement
  bird.rotation.y = bird.userData.orbitAngle + Math.PI / 2;
};
