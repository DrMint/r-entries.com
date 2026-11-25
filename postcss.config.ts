import postcssPresetEnv from "postcss-preset-env";

export default {
  plugins: [
    postcssPresetEnv({
      browsers: ["> 0.2% and not dead"],
    }),
  ],
};
