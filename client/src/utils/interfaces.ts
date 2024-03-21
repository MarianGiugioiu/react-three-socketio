export interface ICharacter {
  id: string,
  position: number[],
  hairColor: string,
  topColor: string,
  bottomColor: string,
  path: any
}

export interface IItem {
  name: string,
  size: number[],
  gridPosition?: number[],
  rotation?: number,
  walkable?: boolean,
  wall?: boolean,
  tmp?: boolean
}

export interface IMap {
  size?: number[],
  gridDivision?: number,
  items?: IItem[],
  rotation?: number
}