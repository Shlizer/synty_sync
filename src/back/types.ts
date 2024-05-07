export type Collection = {
  name: string;
  url: string;
}

export type Pack = {
  name: string;
  collection?: string;
  url: string;
  img: string;
  price: {
    regular: string;
    sale: string;
  }
}

export type PackEx = Pack & {
  type: string;
  tags: string[];
  packagePath?: string;
}

export type Package = {
    name: string;
    iconPath: string;
    packagePath: string;
    packageUrl: string;
    currentVer: string;
    serverVer: string;
    owned: boolean;
}

export type PackageList = Record<string, Package>;
