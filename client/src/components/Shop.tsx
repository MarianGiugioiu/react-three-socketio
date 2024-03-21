import { useMemo, useRef } from "react";
import { useSocket } from "../contexts/SocketContext"
import { useGLTF, useScroll } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { set } from 'lodash';
import { SkeletonUtils } from "three-stdlib";
import { useGrid } from "../hooks/useGrid";

const ShopItem = ({item, ...props}) => {
  const {name, size} = item;
  const { scene } = useGLTF(`/models/items/${name}.glb`);
  const clone = useMemo(() => SkeletonUtils.clone(scene), [scene]);
  const { gridToVector3 } = useGrid();

  return (
    <group {...props}>
      <group position={gridToVector3([0, 0], size[0], size[1])}>
        <primitive object={clone}/>
      </group>
    </group>
  )
}

export const Shop = ({onItemSelected}) => {
  const { items, map } = useSocket();

  const maxX = useRef(0);
  const shopContainer = useRef();
  const scrollData = useScroll();

  const shopItems = useMemo(() => {
    let x = 0;
    return Object.values(items).map((item, index) => {
      const xPos = x;
      x += item.size[0] / map.gridDivision + 1;
      maxX.current = x;
      
      return (
        <ShopItem key={index} position-x={xPos} item={item} onClick={(e) => {e.stopPropagation(); return onItemSelected(item)}}/>
      )
    })
  }, [items]);

  useFrame(() => {
    set(shopContainer, 'current.position.x', -scrollData.offset * maxX.current);
  })

  return (
    <group ref={shopContainer}>
      {shopItems}
    </group>
  )
}