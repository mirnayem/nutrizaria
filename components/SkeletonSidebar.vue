<template>
  <aside
    class="w-64 shrink-0 border-r border-slate-200 bg-white"
    role="status"
    aria-label="Loading categories"
  >
    <nav class="sticky top-[105px] max-h-[calc(100vh-125px)] overflow-hidden p-3">
      <div class="px-3 pb-2 pt-1">
        <div class="h-3 w-14 animate-pulse rounded bg-slate-200"></div>
      </div>

      <div class="flex animate-pulse items-center gap-3 rounded-lg px-3 py-2.5">
        <div class="size-5 rounded bg-slate-200"></div>
        <div class="h-4 w-32 rounded bg-slate-200"></div>
      </div>

      <div class="flex animate-pulse items-center gap-3 rounded-lg px-3 py-2.5">
        <div class="size-5 rounded bg-slate-200"></div>
        <div class="h-4 w-28 rounded bg-slate-200"></div>
      </div>

      <div class="my-3 border-t border-slate-100"></div>

      <div class="px-3 pb-2 pt-1">
        <div class="h-3 w-20 animate-pulse rounded bg-slate-200"></div>
      </div>

      <ul class="space-y-0.5">
        <li
          v-for="i in 8"
          :key="i"
          class="flex animate-pulse items-center rounded-lg"
        >
          <div class="flex min-w-0 flex-1 items-center gap-2.5 px-3 py-2">
            <div class="size-6 rounded-md bg-slate-200"></div>
            <div class="h-3.5 w-24 rounded bg-slate-200"></div>
          </div>
          <div class="flex shrink-0 items-center gap-1 pr-1.5">
            <div class="h-4 w-7 rounded-md bg-slate-200"></div>
            <div class="size-5 rounded-md bg-slate-200"></div>
          </div>
        </li>
      </ul>
    </nav>
  </aside>
</template>