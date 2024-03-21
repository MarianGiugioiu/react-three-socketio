import { useCursor, useGLTF } from "@react-three/drei"
import { IItem } from '../utils/interfaces';
import { useSocket } from "../contexts/SocketContext";
import { useEffect, useMemo, useState } from "react";
import { SkeletonUtils } from "three-stdlib";
import { useGrid } from "../hooks/useGrid";
import { useBuildMode } from "../contexts/BuildModeContext";
import { Mesh } from "three";

export const Item = ({
  item,
  onClick,
  isDragging,
  dragPosition,
  dragRotation,
  canDrop
}) => {
  const socketContext = useSocket();
  const { gridToVector3 } = useGrid();
  const { name, gridPosition, size, rotation: itemRotation } = item;
  const {buildMode, setBuildMode, shopMode, setShopMode, draggedItem, setDraggedItem, draggedItemRotation, setDraggedItemRotation} = useBuildMode();
  const rotation = isDragging ? dragRotation: itemRotation;
  const { scene } = useGLTF(`/models/items/${name}.glb`);
  const clone = useMemo(() => SkeletonUtils.clone(scene), [scene]);
  const width = rotation === 1 || rotation === 3 ? size[1] : size[0];
  const height = rotation === 1 || rotation === 3 ? size[0] : size[1];
  const [hover, setHover] = useState(false);
  useCursor(buildMode ? hover : undefined);

  useEffect(() => {
    clone.traverse((child) => {
      if ((child as Mesh).isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }, [])

  return (
    <group 
      onClick={onClick}
      position={gridToVector3(isDragging ? (dragPosition || gridPosition) : gridPosition, width, height)}
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => setHover(false)}
    >
      <primitive 
        object={clone}
        rotation-y={(rotation || 0)* Math.PI / 2}
      />
      {
        isDragging && (
          <mesh>
            <boxGeometry args={[width / socketContext.map.gridDivision, 0.2, height / socketContext.map.gridDivision]} />
            <meshBasicMaterial
              color={canDrop ? "green" : "red"}
              opacity={0.3}
              transparent
            />
          </mesh>
        )
      }
    </group>
  )
}