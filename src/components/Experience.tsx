import { ContactShadows, Environment, OrbitControls, useCursor } from "@react-three/drei";
import { AnimatedWoman } from "./AnimatedWoman";
import { Character, useSocket } from "../contexts/SocketContext";
import { useEffect, useState } from "react";
import * as THREE from 'three';

export const Experience = () => {
  const socketContext = useSocket();
  const [onFloor, setOnFloor] = useState(false);
  useCursor(onFloor);
  useEffect(() => {
    if (socketContext.characters.length) {
      console.log(socketContext.characters);
    }
    
    return () => {
      if (socketContext.socket) {
      }
    }
  }, [socketContext])
  return (
    <>
      <Environment preset="sunset"/>
      <ambientLight intensity={0.3} />
      <ContactShadows blur={2} />
      <OrbitControls />
      <mesh 
        rotation-x={-Math.PI / 2}
        position-y={-0.001}
        onClick={(e) => socketContext.socket.emit("move", [e.point.x, 0, e.point.z])}
        onPointerEnter={() => setOnFloor(true)}
        onPointerLeave={() => setOnFloor(false)}
      >
        <planeGeometry args={[10, 10]}/>
        <meshStandardMaterial color='#f0f0f0'/>
      </mesh>
      {
        socketContext.characters.map((character: Character) => (
          <AnimatedWoman 
            key={character.id} 
            position={
              new THREE.Vector3(
                character.position[0],
                character.position[1],
                character.position[2]
              )
            }
            hairColor={character.hairColor}
            topColor={character.topColor}
            bottomColor={character.bottomColor}
          />
        ))
      }
    </>
  );
};