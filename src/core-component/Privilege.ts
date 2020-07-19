export interface Privilege {
  id: string;
  name: string;
  resource?: string;
  path: string;
  icon?: string;
  sequence?: number;
  children?: Privilege[];
}
