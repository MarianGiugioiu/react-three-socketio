import { ContactShadows, Environment, Grid, OrbitControls, useCursor } from "@react-three/drei";
import { AnimatedWoman } from "./AnimatedWoman";
import { useSocket } from "../contexts/SocketContext";
import { useEffect, useState } from "react";
import * as THREE from 'three';
import { Item } from "./Items";
import { ICharacter } from "../utils/interfaces";
import { useThree } from "@react-three/fiber";
import { useGrid } from "../hooks/useGrid";


export const Experience = () => {
  const socketContext = useSocket();
  const [onFloor, setOnFloor] = useState(false);
  useCursor(onFloor);
  const {vector3ToGrid, gridToVector3} = useGrid();
  const scene = useThree((state) => state.scene);

  const onCharacterMove = (e) => {
    const character = scene.getObjectByName(`character-${socketContext.user}`);
    if (!character) {
      return;
    }
    socketContext.socket.emit("move", vector3ToGrid(character.position), vector3ToGrid(e.point))
  }

  useEffect(() => {
    if (socketContext.characters.length) {
      
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
      <OrbitControls />
      {
        socketContext.map.items?.map((item, idx) => {
          return (
            <Item key={`${item.name}-${idx}`} item={item}/>
          )
        })
      }
      <mesh 
        rotation-x={-Math.PI / 2}
        position-y={-0.001}
        onClick={onCharacterMove}
        onPointerEnter={() => setOnFloor(true)}
        onPointerLeave={() => setOnFloor(false)}
        position-x={socketContext.map.size?.[0] / 2}
        position-z={socketContext.map.size?.[1] / 2}
      >
        <planeGeometry args={[socketContext.map.size?.[0], socketContext.map.size?.[1]]}/>
        <meshStandardMaterial color='#f0f0f0'/>
      </mesh>
      <Grid infiniteGrid fadeDistance={50} fadeStrength={5} />
      {
        socketContext.characters.map((character: ICharacter) => (
          <AnimatedWoman 
            key={character.id} 
            id={character.id}
            path={character.path}
            position={gridToVector3(character.position)}
            hairColor={character.hairColor}
            topColor={character.topColor}
            bottomColor={character.bottomColor}
          />
        ))
      }
    </>
  );
};