import { NuxtApp } from "#app";

declare module "#app" {
  interface NuxtApp {
    $slugify: (str: string) => string;
  }
}
