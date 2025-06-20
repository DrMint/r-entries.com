import Color from "color";

export const generateColorTheme = (
  foregroundColor: string,
  backgroundColor: string
): Record<string, string> => {
  const foreground = Color(foregroundColor);
  const background = Color(backgroundColor);

  return {
    foreground: foreground.hex(),
    background: background.hex(),
    "foreground-3": background.mix(foreground, 0.03).hex(),
    "foreground-5": background.mix(foreground, 0.05).hex(),
    "foreground-10": background.mix(foreground, 0.1).hex(),
    "foreground-20": background.mix(foreground, 0.2).hex(),
    "foreground-30": background.mix(foreground, 0.3).hex(),
    "foreground-50": background.mix(foreground, 0.5).hex(),
    "foreground-60": background.mix(foreground, 0.6).hex(),
    "foreground-70": background.mix(foreground, 0.7).hex(),
    "foreground-80": background.mix(foreground, 0.8).hex(),
    "foreground-90": background.mix(foreground, 0.9).hex(),
    "layout-border": background.mix(foreground, 0.2).hex(),
    "background-70-transparent": background.alpha(0.7).hexa(),
    "foreground-5-transparent": foreground.alpha(0.05).hexa(),
    "foreground-20-transparent": foreground.alpha(0.2).hexa(),
  };
};

export const generateLightDarkColorTheme = (): Record<string, string> => {
  const lightColors = generateColorTheme("#000000", "#ffffff");
  const darkColors = generateColorTheme("#fbfbfe", "#1c1b22");

  return {
    ...Object.fromEntries(
      Object.entries(lightColors).map(([key, value]) => [`light-${key}`, value])
    ),
    ...Object.fromEntries(
      Object.entries(darkColors).map(([key, value]) => [`dark-${key}`, value])
    ),
  };
};
