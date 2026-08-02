export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook("error", (error, context) => {
    console.error("[nitro:error]", error?.stack || error?.message || error);
  });
});
