import * as THREE from 'three';
import { useSocket } from '../contexts/SocketContext';

export const useGrid = () => {
  const socketContext = useSocket();
  const vector3ToGrid = (vector3) => {
    return [
      Math.floor(vector3.x * socketContext.map.gridDivision),
      Math.floor(vector3.z * socketContext.map.gridDivision),
    ];
  };

  const gridToVector3 = (gridPosition, width = 1, height = 1) => {
    return new THREE.Vector3(
      width / socketContext.map.gridDivision / 2 + gridPosition[0] / socketContext.map.gridDivision,
      0,
      height / socketContext.map.gridDivision / 2 + gridPosition[1] / socketContext.map.gridDivision
    );
  };

  return {
    vector3ToGrid,
    gridToVector3,
  };
}