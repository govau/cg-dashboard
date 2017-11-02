import i18n from "i18next";
import { reactI18nextModule } from "react-i18next";

i18n
  .use({
    type: "backend",
    init(services, backendOptions, i18nextOptions) {
      console.log("init backend");
    },
    read(language, namespace, callback) {
      console.log("read keys");
      return {
        key1: "value1"
      };
    }
  })
  .use(reactI18nextModule)
  .init({
    fallbackLng: "cimode",

    debug: true,

    ns: ["translations"],
    defaultNS: "translations",

    nsSeparator: false,
    keySeparator: false,

    interpolation: {
      escapeValue: false
    },

    react: {
      wait: true,
      nsMode: "fallback"
    }
  });
