import { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import GameHUD from './components/GameHUD';
import GameOver from './components/GameOver';
import Instructions from './components/Instructions';
import SyllableChoices from './components/SyllableChoices';
import { generateRandomSyllable } from '../../shared/utils/syllables';
import { isValidSyllable } from '../../shared/utils/russianOrthography';
import { speakSyllable } from '../../shared/utils/speech';
import { createCar } from './scene/createCar';
import { createTree } from './scene/createTree';
import { createBuilding } from './scene/createBuilding';
import { createCloud } from './scene/createCloud';
import { createMountain } from './scene/createMountain';
import { createStreetLamp } from './scene/createStreetLamp';
import { createBird, animateBird } from './scene/createBird';
import { createRock } from './scene/createRock';
import { createFlower } from './scene/createFlower';

/**
 * Game3D Component
 *
 * 3D racing game where players choose the correct syllable to avoid obstacles
 */
const Game3D = ({ onBack, consonants, vowels, syllableOrder, isUpperCase }) => {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const carRef = useRef(null);
  const roadSegmentsRef = useRef([]);
  const obstaclesRef = useRef([]);
  const sceneryObjectsRef = useRef([]);
  const birdsRef = useRef([]);
  const animationFrameRef = useRef(null);
  const currentObstacleRef = useRef(null);

  const [gameState, setGameState] = useState('playing');
  const [speed, setSpeed] = useState(100);
  const [score, setScore] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [selectedSide, setSelectedSide] = useState(null);
  const [showInstructions, setShowInstructions] = useState(true);

  // Generate syllables
  const generateSyllable = () => {
    let consonant, vowel;
    do {
      consonant = consonants[Math.floor(Math.random() * consonants.length)];
      vowel = vowels[Math.floor(Math.random() * vowels.length)];
    } while (syllableOrder === 'cv' && !isValidSyllable(consonant, vowel));
    return syllableOrder === 'cv' ? consonant + vowel : vowel + consonant;
  };

  const generateWrongSyllable = (correctSyllable) => {
    let wrongSyllable;
    do {
      wrongSyllable = generateSyllable();
    } while (wrongSyllable === correctSyllable);
    return wrongSyllable;
  };

  const createNewQuestion = () => {
    const correctSyllable = generateSyllable();
    const wrongSyllable = generateWrongSyllable(correctSyllable);
    const isCorrectOnLeft = Math.random() > 0.5;

    return {
      correctSyllable,
      wrongSyllable,
      leftSyllable: isCorrectOnLeft ? correctSyllable : wrongSyllable,
      rightSyllable: isCorrectOnLeft ? wrongSyllable : correctSyllable,
      correctSide: isCorrectOnLeft ? 'left' : 'right'
    };
  };

  const setupScene = () => {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB);
    scene.fog = new THREE.Fog(0x87CEEB, 10, 100);
    sceneRef.current = scene;
    return scene;
  };

  const setupCamera = () => {
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 3, 5);
    camera.lookAt(0, 0, -10);
    cameraRef.current = camera;
    return camera;
  };

  const setupRenderer = () => {
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;
    return renderer;
  };

  const setupLights = (scene) => {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xFFF8DC, 1.0);
    directionalLight.position.set(10, 15, 10);
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.left = -30;
    directionalLight.shadow.camera.right = 30;
    directionalLight.shadow.camera.top = 30;
    directionalLight.shadow.camera.bottom = -30;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    const fillLight = new THREE.DirectionalLight(0xFFE4B5, 0.3);
    fillLight.position.set(-5, 5, -5);
    scene.add(fillLight);

    return { ambientLight, directionalLight, fillLight };
  };

  const setupSun = (scene) => {
    const sunGeometry = new THREE.SphereGeometry(3, 16, 16);
    const sunMaterial = new THREE.MeshBasicMaterial({
      color: 0xFFDD88,
      emissive: 0xFFDD88,
      emissiveIntensity: 1
    });
    const sun = new THREE.Mesh(sunGeometry, sunMaterial);
    sun.position.set(30, 25, -40);
    scene.add(sun);
    return sun;
  };

  const setupRoad = (scene) => {
    const roadGeometry = new THREE.PlaneGeometry(8, 25);
    const roadMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
    for (let i = 0; i < 8; i++) {
      const roadSegment = new THREE.Mesh(roadGeometry, roadMaterial);
      roadSegment.rotation.x = -Math.PI / 2;
      roadSegment.position.z = -i * 24;
      roadSegment.receiveShadow = true;
      roadSegment.userData.isRoad = true;
      scene.add(roadSegment);
      roadSegmentsRef.current.push(roadSegment);
    }

    // Road markings
    const markingGeometry = new THREE.PlaneGeometry(0.3, 2);
    const markingMaterial = new THREE.MeshStandardMaterial({ color: 0xFFFFFF });
    for (let i = 0; i < 60; i++) {
      const marking = new THREE.Mesh(markingGeometry, markingMaterial);
      marking.rotation.x = -Math.PI / 2;
      marking.position.set(0, 0.01, -i * 3);
      scene.add(marking);
      roadSegmentsRef.current.push(marking);
    }

    return roadSegmentsRef.current;
  };

  const setupGrass = (scene) => {
    const grassGeometry = new THREE.PlaneGeometry(50, 100);
    const grassMaterial = new THREE.MeshStandardMaterial({ color: 0x2d5016 });
    for (let i = 0; i < 4; i++) {
      const grassLeft = new THREE.Mesh(grassGeometry, grassMaterial);
      grassLeft.rotation.x = -Math.PI / 2;
      grassLeft.position.x = -29;
      grassLeft.position.z = -i * 100;
      grassLeft.receiveShadow = true;
      scene.add(grassLeft);
      roadSegmentsRef.current.push(grassLeft);

      const grassRight = new THREE.Mesh(grassGeometry, grassMaterial);
      grassRight.rotation.x = -Math.PI / 2;
      grassRight.position.x = 29;
      grassRight.position.z = -i * 100;
      grassRight.receiveShadow = true;
      scene.add(grassRight);
      roadSegmentsRef.current.push(grassRight);
    }

    return roadSegmentsRef.current;
  };

  const setupTrees = (scene) => {
    for (let i = 0; i < 20; i++) {
      const z = -i * 8;
      const treeLeft = createTree(-8 - Math.random() * 3, z + Math.random() * 4);
      scene.add(treeLeft);
      sceneryObjectsRef.current.push({ obj: treeLeft, resetZ: -160 });

      const treeRight = createTree(8 + Math.random() * 3, z + Math.random() * 4);
      scene.add(treeRight);
      sceneryObjectsRef.current.push({ obj: treeRight, resetZ: -160 });
    }

    return sceneryObjectsRef.current;
  };

  const setupClouds = (scene) => {
    for (let i = 0; i < 10; i++) {
      const cloud = createCloud((Math.random() - 0.5) * 80, 15 + Math.random() * 10, -Math.random() * 100);
      scene.add(cloud);
    }
  };

  const setupMountains = (scene) => {
    for (let i = 0; i < 12; i++) {
      const mountain = createMountain((Math.random() - 0.5) * 100, -60 - Math.random() * 40);
      scene.add(mountain);
    }
  };

  const setupBuildings = (scene) => {
    for (let i = 0; i < 15; i++) {
      const z = -Math.random() * 100;
      const buildingLeft = createBuilding(-15 - Math.random() * 10, z);
      scene.add(buildingLeft);
      sceneryObjectsRef.current.push({ obj: buildingLeft, resetZ: -100 });

      const buildingRight = createBuilding(15 + Math.random() * 10, z);
      scene.add(buildingRight);
      sceneryObjectsRef.current.push({ obj: buildingRight, resetZ: -100 });
    }
  };

  const setupStreetLamps = (scene) => {
    for (let i = 0; i < 25; i++) {
      const z = -i * 6;
      const lampLeft = createStreetLamp(-5, z);
      scene.add(lampLeft);
      sceneryObjectsRef.current.push({ obj: lampLeft, resetZ: -150 });

      const lampRight = createStreetLamp(5, z);
      scene.add(lampRight);
      sceneryObjectsRef.current.push({ obj: lampRight, resetZ: -150 });
    }
  };

  const setupRocks = (scene) => {
    for (let i = 0; i < 30; i++) {
      const z = -Math.random() * 100;
      const side = Math.random() > 0.5 ? 1 : -1;
      const x = side * (6 + Math.random() * 4);
      const rock = createRock(x, z);
      scene.add(rock);
      sceneryObjectsRef.current.push({ obj: rock, resetZ: -100 });
    }
  };

  const setupFlowers = (scene) => {
    for (let i = 0; i < 40; i++) {
      const z = -Math.random() * 100;
      const side = Math.random() > 0.5 ? 1 : -1;
      const x = side * (7 + Math.random() * 3);
      const flower = createFlower(x, z);
      scene.add(flower);
      sceneryObjectsRef.current.push({ obj: flower, resetZ: -100 });
    }
  };

  const setupBirds = (scene) => {
    const birds = [];
    for (let i = 0; i < 8; i++) {
      const bird = createBird((Math.random() - 0.5) * 40, 8 + Math.random() * 8, -20 - Math.random() * 60);
      scene.add(bird);
      birds.push(bird);
      bird.userData.initialZ = bird.position.z;
    }
    birdsRef.current = birds;
    return birds;
  };

  // Initialize Three.js scene
  useEffect(() => {
    if (!mountRef.current) return;

    const scene = setupScene();
    const camera = setupCamera();
    const renderer = setupRenderer();

    setupLights(scene);
    setupSun(scene);

    setupRoad(scene);
    setupGrass(scene);

    // Scenery
    setupTrees(scene);
    setupClouds(scene);
    setupMountains(scene);
    setupBuildings(scene);
    setupStreetLamps(scene);
    setupRocks(scene);
    setupFlowers(scene);
    setupBirds(scene);

    // Car
    const car = createCar();
    scene.add(car);
    carRef.current = car;

    // Start with first question
    const firstQuestion = createNewQuestion();
    setCurrentQuestion(firstQuestion);
    speakSyllable(firstQuestion.correctSyllable);

    // Animation loop
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);

      // Animate birds
      birdsRef.current.forEach(bird => {
        animateBird(bird);
        bird.userData.orbitCenterZ += gameState === 'playing' && speed > 0 ? speed / 1000 : 0;
        if (bird.userData.orbitCenterZ > 20) {
          bird.userData.orbitCenterZ = -80;
        }
      });

      if (gameState === 'playing' && speed > 0) {
        const moveSpeed = speed / 1000;

        // Move road
        roadSegmentsRef.current.forEach(segment => {
          segment.position.z += moveSpeed;
          if (segment.userData.isRoad || !segment.geometry.parameters) {
            if (segment.position.z > 20) segment.position.z -= 192;
          } else if (segment.position.z > 20) {
            segment.position.z -= 400;
          }
        });

        // Move scenery
        sceneryObjectsRef.current.forEach(item => {
          item.obj.position.z += moveSpeed;
          if (item.obj.position.z > 20) {
            item.obj.position.z = item.resetZ;
          }
        });

        // Move obstacles
        obstaclesRef.current.forEach(obstacle => {
          obstacle.position.z += moveSpeed;

          if (!obstacle.userData.collisionHandled && obstacle.position.z > 0.5 && obstacle.position.z < 3.5) {
            obstacle.userData.collisionHandled = true;
            const carX = carRef.current ? carRef.current.position.x : 0;
            const distance = Math.abs(carX - obstacle.position.x);

            if (distance < 1.5) {
              // HIT! - animate cone knock over
              const startRotationX = obstacle.rotation.x;
              const startRotationZ = obstacle.rotation.z;
              const startY = obstacle.position.y;
              const startX = obstacle.position.x;
              const startTime = Date.now();
              const knockDuration = 600;
              const knockDirection = carX < obstacle.position.x ? 1 : -1;

              obstacle.material.color.setHex(0xFF0000);

              const animateKnock = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / knockDuration, 1);
                const easeOut = 1 - Math.pow(1 - progress, 3);

                obstacle.rotation.x = startRotationX + (Math.PI * 2) * easeOut;
                obstacle.rotation.z = startRotationZ + (Math.PI * 1.5) * easeOut;
                obstacle.position.x = startX + knockDirection * 3 * easeOut;
                const bounceHeight = Math.sin(progress * Math.PI) * 1.5;
                obstacle.position.y = startY + bounceHeight;

                if (progress < 1) requestAnimationFrame(animateKnock);
              };
              animateKnock();

              // Camera shake
              const cameraStartPos = { x: cameraRef.current.position.x, y: cameraRef.current.position.y };
              const shakeStartTime = Date.now();
              const shakeDuration = 300;

              const shakeCamera = () => {
                const elapsed = Date.now() - shakeStartTime;
                const progress = Math.min(elapsed / shakeDuration, 1);
                const intensity = (1 - progress) * 0.15;

                cameraRef.current.position.x = cameraStartPos.x + (Math.random() - 0.5) * intensity;
                cameraRef.current.position.y = cameraStartPos.y + (Math.random() - 0.5) * intensity;

                if (progress < 1) {
                  requestAnimationFrame(shakeCamera);
                } else {
                  cameraRef.current.position.x = cameraStartPos.x;
                  cameraRef.current.position.y = cameraStartPos.y;
                }
              };
              shakeCamera();

              // Car flash - change to yellow then restore
              if (carRef.current) {
                carRef.current.children.forEach((child) => {
                  if (child.material && child.material.color) {
                    const colorHex = child.material.color.getHex();
                    if (colorHex !== 0x1a1a1a && colorHex !== 0x333333) {
                      child.material.color.setHex(0xFFFF00);
                    }
                  }

                  // Process nested children (like wheel groups)
                  if (child.children && child.children.length > 0) {
                    child.children.forEach((nestedChild) => {
                      if (nestedChild.material && nestedChild.material.color) {
                        const colorHex = nestedChild.material.color.getHex();
                        if (colorHex !== 0x1a1a1a && colorHex !== 0x333333 && colorHex !== 0xC0C0C0) {
                          nestedChild.material.color.setHex(0xFFFF00);
                        }
                      }
                    });
                  }
                });

                const carStartY = carRef.current.position.y;
                const bounceStartTime = Date.now();
                const bounceDuration = 200;

                const bounceCar = () => {
                  const elapsed = Date.now() - bounceStartTime;
                  const progress = Math.min(elapsed / bounceDuration, 1);
                  const bounceAmount = Math.sin(progress * Math.PI * 2) * 0.2;
                  carRef.current.position.y = carStartY + bounceAmount;

                  if (progress < 1) {
                    requestAnimationFrame(bounceCar);
                  } else {
                    carRef.current.position.y = carStartY;
                  }
                };
                bounceCar();

                // Restore original colors after flash
                setTimeout(() => {
                  carRef.current.children.forEach((child) => {
                    if (child.material && child.material.color) {
                      const colorHex = child.material.color.getHex();
                      if (colorHex === 0xFFFF00) {
                        child.material.color.setHex(0xFF0000);
                      }
                    }

                    // Process nested children (like wheel groups)
                    if (child.children && child.children.length > 0) {
                      child.children.forEach((nestedChild) => {
                        if (nestedChild.material && nestedChild.material.color) {
                          const colorHex = nestedChild.material.color.getHex();
                          if (colorHex === 0xFFFF00) {
                            nestedChild.material.color.setHex(0xFF0000);
                          }
                        }
                      });
                    }
                  });
                }, 200);
              }
            } else {
              // AVOIDED
              obstacle.material.color.setHex(0x00FF00);
              setTimeout(() => {
                obstacle.material.color.setHex(0xFF6600);
              }, 300);
            }
          }
        });

        // Check if obstacle passed
        if (currentObstacleRef.current && currentObstacleRef.current.position.z > 3) {
          currentObstacleRef.current = null;

          // Move car back to center
          if (carRef.current) {
            const startX = carRef.current.position.x;
            const animationDuration = 500;
            const startTime = Date.now();

            const animateCar = () => {
              const elapsed = Date.now() - startTime;
              const progress = Math.min(elapsed / animationDuration, 1);
              if (carRef.current) {
                carRef.current.position.x = startX + (0 - startX) * progress;
              }

              if (progress < 1) {
                requestAnimationFrame(animateCar);
              } else {
                const newQuestion = createNewQuestion();
                setCurrentQuestion(newQuestion);
                speakSyllable(newQuestion.correctSyllable);
                setHasAnswered(false);
                setSelectedSide(null);
              }
            };
            animateCar();
          }
        }

        // Remove obstacles behind camera
        obstaclesRef.current = obstaclesRef.current.filter(obstacle => {
          if (obstacle.position.z > 5) {
            scene.remove(obstacle);
            return false;
          }
          return true;
        });
      }

      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Hide instructions after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowInstructions(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  // Create obstacle
  const createObstacle = (side) => {
    if (!sceneRef.current) return;

    const coneGeometry = new THREE.ConeGeometry(0.4, 1.2, 8);
    const coneMaterial = new THREE.MeshStandardMaterial({ color: 0xFF6600 });
    const cone = new THREE.Mesh(coneGeometry, coneMaterial);

    const xPosition = side === 'left' ? -2 : 2;
    cone.position.set(xPosition, 0.6, -15);
    cone.castShadow = true;
    cone.userData.collisionHandled = false;
    cone.userData.side = side;

    sceneRef.current.add(cone);
    obstaclesRef.current.push(cone);
    currentObstacleRef.current = cone;
  };

  // Handle answer
  const handleAnswer = (side) => {
    if (hasAnswered || !currentQuestion) return;

    setHasAnswered(true);
    const isCorrect = side === currentQuestion.correctSide;

    setTotalQuestions(prev => prev + 1);
    setSelectedSide(side);

    // Move car
    if (carRef.current) {
      const targetX = side === 'left' ? -2 : 2;
      const startX = carRef.current.position.x;
      const animationDuration = 500;
      const startTime = Date.now();

      const animateCar = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / animationDuration, 1);
        if (carRef.current) {
          carRef.current.position.x = startX + (targetX - startX) * progress;
        }
        if (progress < 1) requestAnimationFrame(animateCar);
      };
      animateCar();
    }

    if (isCorrect) {
      setCorrectAnswers(prev => prev + 1);
      setScore(prev => prev + 10);
      const obstacleSide = side === 'left' ? 'right' : 'left';
      createObstacle(obstacleSide);
    } else {
      setSpeed(prev => Math.max(0, prev - 10));
      createObstacle(side);
      if (speed - 10 <= 0) {
        setGameState('gameover');
      }
    }
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (gameState !== 'playing') return;

      if (e.key === 'ArrowLeft' && !hasAnswered) {
        handleAnswer('left');
      } else if (e.key === 'ArrowRight' && !hasAnswered) {
        handleAnswer('right');
      } else if (e.key === 'ArrowUp' && currentQuestion) {
        speakSyllable(currentQuestion.correctSyllable);
      } else if (e.key === 'Escape') {
        onBack();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, hasAnswered, currentQuestion]);

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <div ref={mountRef} className="w-full h-full" />

      {gameState === 'gameover' && (
        <GameOver
          score={score}
          correctAnswers={correctAnswers}
          totalQuestions={totalQuestions}
          onBack={onBack}
        />
      )}

      <GameHUD
        speed={speed}
        score={score}
        correctAnswers={correctAnswers}
        totalQuestions={totalQuestions}
        onBack={onBack}
      />

      <SyllableChoices
        question={currentQuestion}
        hasAnswered={hasAnswered}
        selectedSide={selectedSide}
        syllableOrder={syllableOrder}
        isUpperCase={isUpperCase}
        onAnswer={handleAnswer}
      />

      <Instructions visible={showInstructions} />
    </div>
  );
};

export default Game3D;
