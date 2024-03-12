import { useGLTF } from "@react-three/drei"
import { IItem } from '../utils/interfaces';
import { useSocket } from "../contexts/SocketContext";
import { useMemo } from "react";
import { SkeletonUtils } from "three-stdlib";

export const Item = ({
  item, 
}) => {
  const socketContext = useSocket();
  const { name, gridPosition, size, rotation } = item;

  const { scene } = useGLTF(`/models/items/${name}.glb`);
  const clone = useMemo(() => SkeletonUtils.clone(scene), [scene]);
  const width = rotation === 1 || rotation === 3 ? size[1] : size[0];
  const height = rotation === 1 || rotation === 3 ? size[0] : size[1];
  return (
    <primitive 
      object={clone}
      position={[
        width / socketContext.map.gridDivision / 2 + gridPosition[0] / socketContext.map.gridDivision,
        0,
        height / socketContext.map.gridDivision / 2 + gridPosition[1] / socketContext.map.gridDivision
      ]}
      rotation-y={(rotation || 0)* Math.PI / 2}
    />
  )
}