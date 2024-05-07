type Page = {
  url: string;
}

type ConfigSynty = {
  login: Page & {
    idForm: string;
    idEmailField: string;
    idPasswordField: string;
  },
  account: Page,
  orders: Page,
  collections: Page,
}

const syntyConfig: ConfigSynty = {
  login: {
    url: "https://syntystore.com/account/login",
    idForm: "#customer_login",
    idEmailField: "#CustomerEmail",
    idPasswordField: "#CustomerPassword",
  },
  account: {
      url: "https://syntystore.com/account",
  },
  orders: {
      url: "https://syntystore.com/apps/downloads/orders/",
  },
  collections: {
    url: "https://syntystore.com/collections/",
  },
}

export default { syntyConfig }
