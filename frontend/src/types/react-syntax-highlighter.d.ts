declare module "react-syntax-highlighter" {
  import type { ComponentType, ReactNode } from "react";

  export interface SyntaxHighlighterProps {
    language?: string;
    style?: unknown;
    PreTag?: keyof JSX.IntrinsicElements | ComponentType<any>;
    children?: ReactNode;
    [key: string]: unknown;
  }

  export const Prism: ComponentType<SyntaxHighlighterProps>;
}

declare module "react-syntax-highlighter/dist/esm/styles/prism" {
  export const vscDarkPlus: unknown;
}
