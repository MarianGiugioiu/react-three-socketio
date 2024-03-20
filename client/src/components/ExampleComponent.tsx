import { Canvas } from "@react-three/fiber";
import { useSocket } from "../contexts/SocketContext";
import { Experience } from "./Experience";
import { UI } from "./UI";

const ExampleComponent = () => {
  const socket = useSocket();
  
  return (
    <>
      <Canvas shadows camera={{ position: [8, 8, 8], fov: 30 }}>
        <color attach="background" args={["#ececec"]} />
        <Experience />
      </Canvas>
      <UI />
    </>
  );
};

export default ExampleComponent;