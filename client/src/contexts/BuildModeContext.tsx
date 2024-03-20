import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { ICharacter, IMap } from '../utils/interfaces';

export interface BuildModeContext {
  buildMode: boolean,
  setBuildMode: React.Dispatch<React.SetStateAction<boolean>>,
  shopMode: boolean,
  setShopMode: React.Dispatch<React.SetStateAction<boolean>>,
  draggedItem: number,
  setDraggedItem: React.Dispatch<React.SetStateAction<number>>,
  draggedItemRotation: number,
  setDraggedItemRotation: React.Dispatch<React.SetStateAction<number>>,

}

export const BuildModeContext = createContext<BuildModeContext | undefined>(undefined);

export const useBuildMode = (): BuildModeContext => {
  const buildModeContext = useContext(BuildModeContext);
  return buildModeContext;
};

export const BuildModeProvider = ({ children }) => {
  const [buildMode, setBuildMode] = useState(false);
  const [shopMode, setShopMode] = useState(false);
  const [draggedItem, setDraggedItem] = useState(undefined);
  const [draggedItemRotation, setDraggedItemRotation] = useState(0);
  useEffect(() => {
    

    return () => {

    };
  }, []);

  return <BuildModeContext.Provider value={{buildMode, setBuildMode, shopMode, setShopMode, draggedItem, setDraggedItem, draggedItemRotation, setDraggedItemRotation}}>{children}</BuildModeContext.Provider>;
};