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
  gridPosition?: number[]
}

export interface IMap {
  size?: number[],
  gridDivision?: number,
  items?: IItem[],
  rotation?: number
}