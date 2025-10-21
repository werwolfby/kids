import * as THREE from 'three';

/**
 * Creates a low-poly sports car model
 * @returns {THREE.Group} - Car group object
 */
export const createCar = () => {
  const carGroup = new THREE.Group();

  // Car body (main chassis) - wider and sleeker
  const bodyGeometry = new THREE.BoxGeometry(1.6, 0.6, 2.8);
  const bodyMaterial = new THREE.MeshStandardMaterial({
    color: 0xFF0000,
    metalness: 0.6,
    roughness: 0.4
  });
  const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
  body.position.y = 0.5;
  body.castShadow = true;
  carGroup.add(body);

  // Lower body/chassis
  const lowerBodyGeometry = new THREE.BoxGeometry(1.7, 0.3, 2.6);
  const lowerBody = new THREE.Mesh(lowerBodyGeometry, bodyMaterial);
  lowerBody.position.y = 0.2;
  lowerBody.castShadow = true;
  carGroup.add(lowerBody);

  // Car cabin (more aerodynamic)
  const cabinGeometry = new THREE.BoxGeometry(1.4, 0.7, 1.6);
  const cabinMaterial = new THREE.MeshStandardMaterial({
    color: 0xCC0000,
    metalness: 0.5,
    roughness: 0.5
  });
  const cabin = new THREE.Mesh(cabinGeometry, cabinMaterial);
  cabin.position.y = 1.05;
  cabin.position.z = -0.3;
  cabin.castShadow = true;
  carGroup.add(cabin);

  // Roof
  const roofGeometry = new THREE.BoxGeometry(1.3, 0.2, 1.2);
  const roof = new THREE.Mesh(roofGeometry, cabinMaterial);
  roof.position.y = 1.5;
  roof.position.z = -0.3;
  roof.castShadow = true;
  carGroup.add(roof);

  // Windows
  const windowMaterial = new THREE.MeshStandardMaterial({
    color: 0x333333,
    transparent: true,
    opacity: 0.3,
    metalness: 0.9,
    roughness: 0.1
  });

  // Front windshield
  const frontWindowGeometry = new THREE.PlaneGeometry(1.3, 0.6);
  const frontWindow = new THREE.Mesh(frontWindowGeometry, windowMaterial);
  frontWindow.position.set(0, 1.1, 0.5);
  frontWindow.rotation.x = -0.2;
  carGroup.add(frontWindow);

  // Rear window
  const rearWindow = new THREE.Mesh(frontWindowGeometry, windowMaterial);
  rearWindow.position.set(0, 1.1, -1.1);
  rearWindow.rotation.x = 0.2;
  rearWindow.rotation.y = Math.PI;
  carGroup.add(rearWindow);

  // Side windows
  const sideWindowGeometry = new THREE.PlaneGeometry(1.4, 0.5);
  const leftWindow = new THREE.Mesh(sideWindowGeometry, windowMaterial);
  leftWindow.position.set(-0.7, 1.1, -0.3);
  leftWindow.rotation.y = Math.PI / 2;
  carGroup.add(leftWindow);

  const rightWindow = new THREE.Mesh(sideWindowGeometry, windowMaterial);
  rightWindow.position.set(0.7, 1.1, -0.3);
  rightWindow.rotation.y = -Math.PI / 2;
  carGroup.add(rightWindow);

  // Front bumper
  const bumperGeometry = new THREE.BoxGeometry(1.7, 0.2, 0.3);
  const bumperMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
  const frontBumper = new THREE.Mesh(bumperGeometry, bumperMaterial);
  frontBumper.position.set(0, 0.25, 1.55);
  frontBumper.castShadow = true;
  carGroup.add(frontBumper);

  // Rear bumper
  const rearBumper = new THREE.Mesh(bumperGeometry, bumperMaterial);
  rearBumper.position.set(0, 0.25, -1.55);
  rearBumper.castShadow = true;
  carGroup.add(rearBumper);

  // Headlights
  const headlightGeometry = new THREE.SphereGeometry(0.15, 8, 8);
  const headlightMaterial = new THREE.MeshStandardMaterial({
    color: 0xFFFFFF,
    emissive: 0xFFFFFF,
    emissiveIntensity: 0.8
  });

  const leftHeadlight = new THREE.Mesh(headlightGeometry, headlightMaterial);
  leftHeadlight.position.set(-0.5, 0.4, 1.45);
  carGroup.add(leftHeadlight);

  const rightHeadlight = new THREE.Mesh(headlightGeometry, headlightMaterial);
  rightHeadlight.position.set(0.5, 0.4, 1.45);
  carGroup.add(rightHeadlight);

  // Taillights
  const taillightMaterial = new THREE.MeshStandardMaterial({
    color: 0xFF0000,
    emissive: 0xFF0000,
    emissiveIntensity: 0.5
  });

  const leftTaillight = new THREE.Mesh(headlightGeometry, taillightMaterial);
  leftTaillight.position.set(-0.5, 0.5, -1.45);
  carGroup.add(leftTaillight);

  const rightTaillight = new THREE.Mesh(headlightGeometry, taillightMaterial);
  rightTaillight.position.set(0.5, 0.5, -1.45);
  carGroup.add(rightTaillight);

  // Side mirrors
  const mirrorGeometry = new THREE.BoxGeometry(0.1, 0.15, 0.25);
  const mirrorMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });

  const leftMirror = new THREE.Mesh(mirrorGeometry, mirrorMaterial);
  leftMirror.position.set(-0.85, 1.0, 0.3);
  carGroup.add(leftMirror);

  const rightMirror = new THREE.Mesh(mirrorGeometry, mirrorMaterial);
  rightMirror.position.set(0.85, 1.0, 0.3);
  carGroup.add(rightMirror);

  // Spoiler
  const spoilerBaseGeometry = new THREE.BoxGeometry(0.2, 0.5, 0.1);
  const spoilerBase = new THREE.Mesh(spoilerBaseGeometry, bodyMaterial);
  spoilerBase.position.set(0, 1.1, -1.4);
  carGroup.add(spoilerBase);

  const spoilerWingGeometry = new THREE.BoxGeometry(1.5, 0.1, 0.4);
  const spoilerWing = new THREE.Mesh(spoilerWingGeometry, bodyMaterial);
  spoilerWing.position.set(0, 1.4, -1.4);
  spoilerWing.castShadow = true;
  carGroup.add(spoilerWing);

  // Wheels with better design (tire + rim)
  const wheelPositions = [
    [-0.8, 0.3, 0.9],
    [0.8, 0.3, 0.9],
    [-0.8, 0.3, -0.9],
    [0.8, 0.3, -0.9]
  ];

  wheelPositions.forEach(pos => {
    const wheelGroup = new THREE.Group();

    // Tire
    const tireGeometry = new THREE.CylinderGeometry(0.35, 0.35, 0.35, 12);
    const tireMaterial = new THREE.MeshStandardMaterial({ color: 0x1a1a1a });
    const tire = new THREE.Mesh(tireGeometry, tireMaterial);
    tire.castShadow = true;
    wheelGroup.add(tire);

    // Rim (inner part)
    const rimGeometry = new THREE.CylinderGeometry(0.25, 0.25, 0.37, 12);
    const rimMaterial = new THREE.MeshStandardMaterial({
      color: 0xC0C0C0,
      metalness: 0.8,
      roughness: 0.2
    });
    const rim = new THREE.Mesh(rimGeometry, rimMaterial);
    wheelGroup.add(rim);

    // Rim center cap
    const capGeometry = new THREE.CylinderGeometry(0.12, 0.12, 0.38, 8);
    const capMaterial = new THREE.MeshStandardMaterial({
      color: 0xFF0000,
      metalness: 0.6,
      roughness: 0.3
    });
    const cap = new THREE.Mesh(capGeometry, capMaterial);
    wheelGroup.add(cap);

    wheelGroup.rotation.z = Math.PI / 2;
    wheelGroup.position.set(...pos);
    carGroup.add(wheelGroup);
  });

  // Hood details (air vents)
  const ventGeometry = new THREE.BoxGeometry(0.3, 0.05, 0.15);
  const ventMaterial = new THREE.MeshStandardMaterial({ color: 0x222222 });

  const leftVent = new THREE.Mesh(ventGeometry, ventMaterial);
  leftVent.position.set(-0.3, 0.85, 0.8);
  carGroup.add(leftVent);

  const rightVent = new THREE.Mesh(ventGeometry, ventMaterial);
  rightVent.position.set(0.3, 0.85, 0.8);
  carGroup.add(rightVent);

  carGroup.position.set(0, 0, 2);
  return carGroup;
};
