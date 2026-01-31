declare module "color" {
  interface Color {
    hex(): string;
    luminosity(): number;
    mix(color: Color, weight?: number): Color;
    lighten(amount: number): Color;
    darken(amount: number): Color;
    isLight(): boolean;
    isDark(): boolean;
  }
  function color(hex: string): Color;
  export = color;
}
