import fs from "fs"

const defaultConfigPath = "config.json";

type ConfigModel = {
  window: {
      position: {
          top: number,
          left: number
      },
      size: {
          width: number,
          height: number
      },
      pinned: boolean,
      maximized: boolean
  },

  syntyLogin?: string;
  syntyPassword?: string;
  localPackageDir: string;
}

const defaultConfig: ConfigModel = {
  window: {
    position: {
      top: 100,
      left: 100,
    },
    size: {
      width: 300,
      height: 300,
    },
    pinned: false,
    maximized: false
  },
  syntyLogin: "",
  syntyPassword: "",

  localPackageDir: ""
}

const getConfig = (): ConfigModel => {
  try {
    if (fs.existsSync(defaultConfigPath)) {
      return {
        ...defaultConfig,
        ...JSON.parse(fs.readFileSync(defaultConfigPath) as any) as ConfigModel,
      }
    } else {
      fs.writeFileSync(defaultConfigPath, JSON.stringify(defaultConfig));
      return defaultConfig;
    }
  } catch(e) {
    return defaultConfig;
    //throw new Error("error while loading config file");
  }
}

const setConfig = (data: ConfigModel) => {
  try {
    fs.writeFileSync(defaultConfigPath, JSON.stringify(Object.assign({}, defaultConfig, data)));
  } catch (error) {
    throw new Error("error while saving config file");
  }
};

export { ConfigModel, getConfig, setConfig };