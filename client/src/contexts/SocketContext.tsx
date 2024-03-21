import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { ICharacter, IItem, IMap } from '../utils/interfaces';

export interface SocketContext {
  socket: Socket,
  characters: ICharacter[],
  map: IMap,
  user: string,
  items: IItem[]
}

export const SocketContext = createContext<SocketContext | undefined>(undefined);

export const useSocket = (): SocketContext => {
  const socketContext = useContext(SocketContext);
  return socketContext;
};

export const SocketProvider = ({ url, children }) => {
  const [socket, setSocket] = useState<Socket | undefined>(undefined);
  const [characters, setCharacters] = useState<ICharacter[] | undefined>([]);
  const [map, setMap] = useState<IMap | undefined>({});
  const [user, setUser] = useState<string>(null);
  const [items, setItems] = useState<IItem[] | undefined>([]);

  useEffect(() => {
    const newSocket = io(url);
    setSocket(newSocket);
    newSocket.on('hello', (value) => {
      setMap(value.map);
      setUser(value.id);
      setCharacters(value.characters);
      setItems(value.items)
    });
    newSocket.on('characters', (characters) => {
      setCharacters(characters);
    });

    newSocket.on('playerMove', (character) => {
      setCharacters((prev) => {
        return prev.map((item) => {
          if (item.id === character.id) {
            return character;
          }
          return item;
        });
      });
    });

    newSocket.on('mapUpdated', ({map, characters}) => {
      setMap(map);
      setCharacters(characters);
    });

    return () => {
      newSocket.off('hello');
      newSocket.off('characters');
      newSocket.off('mapUpdate');
      newSocket.off('playerMove');
      newSocket.disconnect();
    };
  }, [url]);

  return <SocketContext.Provider value={{socket, characters, map, user, items}}>{children}</SocketContext.Provider>;
};