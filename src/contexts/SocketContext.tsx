import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export interface SocketContext {
  socket: Socket,
  characters: Character[]
}

export interface Character {
  id: string,
  position: number[],
  hairColor: string,
  topColor: string,
  bottomColor: string
}

export const SocketContext = createContext<SocketContext | undefined>(undefined);

export const useSocket = (): SocketContext => {
  const socketContext = useContext(SocketContext);
  return socketContext;
};

export const SocketProvider = ({ url, children }) => {
  const [socket, setSocket] = useState<Socket | undefined>(undefined);
  const [characters, setCharacters] = useState<Character[] | undefined>([]);

  useEffect(() => {
    const newSocket = io(url);
    setSocket(newSocket);
    newSocket.on('hello', () => {
      console.log('hello');
      
    })
    newSocket.on('characters', (characters) => {
      setCharacters(characters);
    })

    return () => {
      newSocket.off('hello');
      newSocket.off('characters');
      newSocket.disconnect();
    };
  }, [url]);

  return <SocketContext.Provider value={{socket, characters}}>{children}</SocketContext.Provider>;
};