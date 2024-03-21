import { Environment, Grid, OrbitControls, useCursor } from "@react-three/drei";
import { AnimatedWoman } from "./AnimatedWoman";
import { useSocket } from "../contexts/SocketContext";
import { useEffect, useRef, useState } from "react";
import * as THREE from 'three';
import { Item } from "./Items";
import { ICharacter, IItem } from "../utils/interfaces";
import { useThree } from "@react-three/fiber";
import { useGrid } from "../hooks/useGrid";
import { useBuildMode } from "../contexts/BuildModeContext";
import { Shop } from "./Shop";


export const Experience = () => {
  const socketContext = useSocket();
  const {buildMode, setBuildMode, shopMode, setShopMode, draggedItem, setDraggedItem, draggedItemRotation, setDraggedItemRotation} = useBuildMode();
  // const [draggedItem, setDraggedItem] = useState(null);
  const [dragPosition, setDragPosition] = useState([0, 0]);
  const [onFloor, setOnFloor] = useState(false);
  const [items, setItems] = useState<IItem[] | undefined>([]);
  const [canDrop, setCanDrop] = useState(false);
  useCursor(onFloor);
  const {vector3ToGrid, gridToVector3} = useGrid();
  const scene = useThree((state) => state.scene);
  const controls = useRef();
  const state = useThree((state) => state);

  const onPlaneClicked = (e) => {
    if (!buildMode) {
      const character = scene.getObjectByName(`character-${socketContext.user}`);
      if (!character) {
        return;
      }
      socketContext.socket.emit("move", vector3ToGrid(character.position), vector3ToGrid(e.point));
    } else {
      if (draggedItem !== null) {
        if (canDrop) {
          setItems((prev) => {
            const newItems = [...prev];
            delete newItems[draggedItem].tmp;
            newItems[draggedItem].gridPosition = vector3ToGrid(e.point);
            newItems[draggedItem].rotation = draggedItemRotation;
            return newItems;
          });
        }
        setDraggedItem(null);
      }
    }
  }

  const onItemSelected = (item) => {
    setShopMode(false);
    setItems((prev) => [
      ...prev,
      {
        ...item,
        gridPosition: [0, 0],
        tmp: true
      }
    ]);

    setDraggedItem(items.length);
    setDraggedItemRotation(0);
  }

  useEffect(() => {
    if (!draggedItem) {
      return;
    }
    const item = items[draggedItem];
    const width = draggedItemRotation === 1 || draggedItemRotation === 3 ? item.size[1] : item.size[0];
    const height = draggedItemRotation === 1 || draggedItemRotation === 3 ? item.size[0] : item.size[1];

    let droppable = true;

    if (dragPosition[0] < 0 || dragPosition[0] + width > socketContext.map.size[0] * socketContext.map.gridDivision) {
      droppable = false;
    }
    if (dragPosition[1] < 0 || dragPosition[1] + height > socketContext.map.size[1] * socketContext.map.gridDivision
    ) {
      droppable = false;
    }

    if (!item.walkable && !item.wall) {
      items.forEach((otherItem, idx) => {
        // ignore self
        if (idx === draggedItem) {
          return;
        }

        // ignore wall & floor
        if (otherItem.walkable || otherItem.wall) {
          return;
        }

        // check item overlap
        const otherWidth =
          otherItem.rotation === 1 || otherItem.rotation === 3
            ? otherItem.size[1]
            : otherItem.size[0];
        const otherHeight =
          otherItem.rotation === 1 || otherItem.rotation === 3
            ? otherItem.size[0]
            : otherItem.size[1];
        if (
          dragPosition[0] < otherItem.gridPosition[0] + otherWidth &&
          dragPosition[0] + width > otherItem.gridPosition[0] &&
          dragPosition[1] < otherItem.gridPosition[1] + otherHeight &&
          dragPosition[1] + height > otherItem.gridPosition[1]
        ) {
          droppable = false;
        }
      });
    }

    setCanDrop(droppable);
  }, [dragPosition, draggedItem, items, draggedItemRotation]);

  useEffect(() => {
    if (draggedItem === null) {
      setItems((prev) => prev.filter((item) => !item.tmp));
    }
  }, [draggedItem])

  useEffect(() => {
    if (buildMode) {
      setItems(socketContext.map?.items || []);
      state.camera.position.set(8, 8, 8);
      (controls.current as any).target.set(0, 0, 0);
    } else {
      if (socketContext.map.items) {
        socketContext.socket.emit('itemsUpdate', items)
      }
    }
  }, [buildMode]);

  useEffect(() => {
    if (shopMode) {
      state.camera.position.set(0, 4, 10);
      (controls.current as any).target.set(0, 0, 0);
    } else {
      state.camera.position.set(8, 8, 8);
      (controls.current as any).target.set(0, 0, 0);
    }
  }, [shopMode]);

  useEffect(() => {
    if (socketContext.characters.length) {
      
    }
    setItems(socketContext.map.items);
    
    return () => {
      if (socketContext.socket) {
      }
    }
  }, [socketContext]);
  
  return (
    <>
      <Environment preset="sunset"/>
      <ambientLight intensity={0.1} />
      <directionalLight position={[-4, 4, -4]} castShadow intensity={0.35} shadow-mapSize={[1024, 1024]}>
        <orthographicCamera
          attach={"shadow-camera"}
          args={[-(socketContext.map.size?.[0] ?? 10), (socketContext.map.size?.[1] ?? 10), 10, -10]}
          far={(socketContext.map.size?.[0] ?? 10) + (socketContext.map.size?.[1] ?? 10)}
        />
      </directionalLight>
      <OrbitControls ref={controls} minDistance={5} maxDistance={20} minPolarAngle={0} maxPolarAngle={Math.PI / 2} screenSpacePanning={false} enableZoom={!shopMode}/>
      {
        shopMode && <Shop onItemSelected={onItemSelected}/>
      }
      {
        !shopMode && (buildMode ? items : socketContext.map.items)?.map((item, idx) => {
          return (
            <Item 
              key={`${item.name}-${idx}`}
              item={item}
              onClick={() => {
                if (buildMode) {
                  setDraggedItem((prev) => prev === null ? idx : prev);
                  setDraggedItemRotation(item.rotation || 0);
                }
              }}
              isDragging={draggedItem === idx}
              dragPosition={dragPosition}
              dragRotation={draggedItemRotation}
              canDrop={canDrop}
            />
          )
        })
      }
      {
        !shopMode && <mesh 
          rotation-x={-Math.PI / 2}
          position-y={-0.001}
          onClick={onPlaneClicked}
          onPointerEnter={() => setOnFloor(true)}
          onPointerLeave={() => setOnFloor(false)}
          onPointerMove={(e) => {
            if(!buildMode) {
              return;
            }
            const newPosition = vector3ToGrid(e.point);
            if (!dragPosition || newPosition[0] !== dragPosition[0] || newPosition[1] !== dragPosition[1]
            ) {
              setDragPosition(newPosition);
            }
          }}
          position-x={socketContext.map.size?.[0] / 2}
          position-z={socketContext.map.size?.[1] / 2}
          receiveShadow
        >
          <planeGeometry args={[socketContext.map.size?.[0], socketContext.map.size?.[1]]}/>
          <meshStandardMaterial color='#f0f0f0'/>
        </mesh>
      }
      {
        buildMode && !shopMode && <Grid infiniteGrid fadeDistance={50} fadeStrength={5} />
      }
      {
        !buildMode && socketContext.characters.map((character: ICharacter) => (
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