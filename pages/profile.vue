<template>
  <ClientOnly>
    <main class="py-6 sm:py-10">
      <div class="mb-6 flex flex-wrap items-center gap-2 text-sm text-slate-500">
        <NuxtLink to="/" class="transition hover:text-violet-600">Home</NuxtLink>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="size-3.5 text-slate-300"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="2"
          stroke="currentColor"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
        </svg>
        <span class="font-medium text-slate-700">My account</span>
      </div>

      <div class="grid gap-8 lg:grid-cols-[250px_minmax(0,1fr)]">
        <aside class="lg:sticky lg:top-24 lg:h-fit">
          <div class="mb-5 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <span
              class="flex size-12 flex-shrink-0 items-center justify-center rounded-full bg-violet-600 text-base font-bold text-white"
            >
              {{ userStore.initials }}
            </span>
            <div class="min-w-0">
              <p class="truncate text-sm font-semibold text-slate-900">{{ userStore.displayName }}</p>
              <p class="truncate text-xs text-slate-500">{{ userStore.authenticatedUser?.email }}</p>
              <p v-if="memberSince" class="mt-0.5 text-[11px] text-slate-400">
                Member since {{ memberSince }}
              </p>
            </div>
          </div>

          <nav
            class="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible"
            aria-label="Account sections"
          >
            <button
              v-for="item in tabs"
              :key="item.id"
              type="button"
              class="flex flex-shrink-0 items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition"
              :class="
                activeTab === item.id
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-violet-50 hover:text-violet-700'
              "
              @click="setTab(item.id)"
            >
              <component :is="item.icon" class="size-5" />
              {{ item.label }}
              <span
                v-if="item.id === 'orders' && orders.length"
                class="ml-auto rounded-full px-2 py-0.5 text-[10px] font-bold"
                :class="activeTab === 'orders' ? 'bg-white/20 text-white' : 'bg-violet-100 text-violet-700'"
              >
                {{ orders.length }}
              </span>
            </button>

            <button
              type="button"
              class="mt-1 flex flex-shrink-0 items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-rose-600 transition hover:bg-rose-50"
              @click="handleLogout"
            >
              <ArrowRightStartOnRectangleIcon class="size-5" />
              Sign out
            </button>
          </nav>
        </aside>

        <section class="min-w-0">
          <template v-if="activeTab === 'overview'">
            <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 class="text-2xl font-semibold text-slate-900">
                  Welcome back, {{ firstName }}
                </h1>
                <p class="mt-1 text-sm text-slate-500">
                  Here's what's happening with your account today.
                </p>
              </div>
              <NuxtLink
                to="/shop"
                class="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-500"
              >
                Continue shopping
              </NuxtLink>
            </div>

            <div class="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
              <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <p class="text-xs font-medium text-slate-500">Total orders</p>
                <p class="mt-1 text-2xl font-bold text-slate-900">{{ orders.length }}</p>
              </div>
              <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <p class="text-xs font-medium text-slate-500">Total spent</p>
                <p class="mt-1 text-2xl font-bold text-slate-900">
                  {{ currencySymbol }}{{ totalSpent.toFixed(2) }}
                </p>
              </div>
              <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <p class="text-xs font-medium text-slate-500">Favorites</p>
                <p class="mt-1 text-2xl font-bold text-slate-900">{{ favoriteStore.items.length }}</p>
              </div>
              <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <p class="text-xs font-medium text-slate-500">Addresses</p>
                <p class="mt-1 text-2xl font-bold text-slate-900">{{ addresses.length }}</p>
              </div>
            </div>

            <div class="mt-6 grid gap-6 lg:grid-cols-2">
              <section class="rounded-2xl border border-slate-200 bg-white shadow-sm">
                <header class="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                  <h2 class="text-base font-semibold text-slate-900">Recent orders</h2>
                  <NuxtLink
                    to="/profile?tab=orders"
                    class="text-xs font-semibold text-violet-700 transition hover:text-violet-500"
                  >
                    View all
                  </NuxtLink>
                </header>
                <div v-if="ordersLoading" class="space-y-3 p-5">
                  <div v-for="i in 3" :key="i" class="h-14 animate-pulse rounded-xl bg-slate-100"></div>
                </div>
                <div v-else-if="orders.length" class="divide-y divide-slate-100">
                  <NuxtLink
                    v-for="order in recentOrders"
                    :key="order.id || order.orderNumber"
                    to="/profile?tab=orders"
                    class="flex items-center gap-4 px-5 py-4 transition hover:bg-slate-50"
                  >
                    <div class="min-w-0 flex-1">
                      <p class="truncate text-sm font-semibold text-slate-800">
                        {{ order.orderNumber || order.id }}
                      </p>
                      <p class="text-xs text-slate-500">{{ formatDate(order.createdAt) }}</p>
                    </div>
                    <div class="text-right">
                      <p class="text-sm font-bold text-slate-900">
                        {{ currencySymbol }}{{ (order.total || 0).toFixed(2) }}
                      </p>
                      <OrderStatusBadge :status="order.status" />
                    </div>
                  </NuxtLink>
                </div>
                <div v-else class="px-5 py-10 text-center">
                  <p class="text-sm font-medium text-slate-700">No orders yet</p>
                  <p class="mt-1 text-xs text-slate-500">Your orders will appear here once you place one.</p>
                </div>
              </section>

              <section class="rounded-2xl border border-slate-200 bg-white shadow-sm">
                <header class="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                  <h2 class="text-base font-semibold text-slate-900">Quick actions</h2>
                </header>
                <div class="grid grid-cols-1 gap-2 p-4 sm:grid-cols-2">
                  <NuxtLink
                    v-for="action in quickActions"
                    :key="action.to"
                    :to="action.to"
                    class="flex items-center gap-3 rounded-xl border border-slate-100 p-3 text-sm font-medium text-slate-700 transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700"
                  >
                    <component :is="action.icon" class="size-5 text-violet-600" />
                    {{ action.label }}
                  </NuxtLink>
                </div>
              </section>
            </div>
          </template>

          <template v-else-if="activeTab === 'orders'">
            <div class="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h1 class="text-2xl font-semibold text-slate-900">My orders</h1>
                <p class="mt-1 text-sm text-slate-500">
                  Track and review all your purchases in one place.
                </p>
              </div>
              <div v-if="orders.length" class="rounded-xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm">
                <p class="text-[11px] font-medium uppercase tracking-wide text-slate-400">Total spent</p>
                <p class="text-lg font-bold text-slate-900">{{ currencySymbol }}{{ totalSpent.toFixed(2) }}</p>
              </div>
            </div>

            <div v-if="orders.length" class="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div class="flex flex-wrap gap-2" role="tablist" aria-label="Filter orders by status">
                <button
                  v-for="option in statusOptions"
                  :key="option.key"
                  type="button"
                  role="tab"
                  :aria-selected="ordersFilter === option.key"
                  class="inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition"
                  :class="
                    ordersFilter === option.key
                      ? 'border-violet-600 bg-violet-600 text-white shadow-sm'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-violet-300 hover:text-violet-700'
                  "
                  @click="ordersFilter = option.key"
                >
                  {{ option.label }}
                  <span
                    class="rounded-full px-1.5 py-0.5 text-[10px] font-bold"
                    :class="
                      ordersFilter === option.key
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-100 text-slate-500'
                    "
                  >
                    {{ option.count }}
                  </span>
                </button>
              </div>
              <div class="relative sm:w-64">
                <MagnifyingGlassIcon class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <input
                  v-model="ordersSearch"
                  type="search"
                  placeholder="Search order number…"
                  class="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                />
              </div>
            </div>

            <div v-if="ordersLoading" class="mt-6 space-y-4">
              <div v-for="i in 3" :key="i" class="h-28 animate-pulse rounded-2xl bg-slate-100"></div>
            </div>

            <div v-else-if="filteredOrders.length" class="mt-6 space-y-4">
              <article
                v-for="order in filteredOrders"
                :key="order.id || order.orderNumber"
                class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
              >
                <button
                  type="button"
                  class="flex w-full flex-wrap items-center gap-x-4 gap-y-3 px-5 py-4 text-left transition hover:bg-slate-50"
                  :aria-expanded="expandedOrder === (order.id || order.orderNumber)"
                  @click="toggleOrder(order)"
                >
                  <div class="flex items-center gap-4">
                    <div class="flex -space-x-3">
                      <div
                        v-for="item in orderThumbnails(order)"
                        :key="item.productId || item.id"
                        class="size-11 overflow-hidden rounded-xl border-2 border-white bg-slate-100 shadow-sm"
                      >
                        <img
                          :src="itemImage(item)"
                          :alt="item.name"
                          class="size-full object-cover"
                          loading="lazy"
                        />
                      </div>
                      <div
                        v-if="orderItems(order).length > 4"
                        class="flex size-11 items-center justify-center rounded-xl border-2 border-white bg-slate-100 text-xs font-bold text-slate-500 shadow-sm"
                      >
                        +{{ orderItems(order).length - 4 }}
                      </div>
                    </div>
                  </div>

                  <div class="min-w-0 flex-1">
                    <p class="truncate text-sm font-semibold text-slate-900">
                      {{ order.orderNumber || order.id }}
                    </p>
                    <p class="mt-0.5 text-xs text-slate-500">
                      Placed {{ formatDate(order.createdAt) }} · {{ itemsText(order) }}
                    </p>
                    <p class="mt-1 inline-flex items-center gap-1 text-xs font-medium text-slate-500">
                      <span class="size-1.5 rounded-full bg-emerald-500"></span>
                      {{ paymentLabel(order) }}
                      <span class="text-slate-300">·</span>
                      <OrderStatusBadge :status="paymentStatus(order)" />
                    </p>
                  </div>

                  <div class="flex items-center gap-3">
                    <div class="text-right">
                      <p class="text-sm font-bold text-slate-900">
                        {{ currencySymbol }}{{ (order.total || 0).toFixed(2) }}
                      </p>
                      <OrderStatusBadge :status="order.status" />
                    </div>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="size-4 text-slate-400 transition-transform"
                      :class="expandedOrder === (order.id || order.orderNumber) ? 'rotate-180' : ''"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width="1.5"
                      stroke="currentColor"
                    >
                      <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                    </svg>
                  </div>
                </button>

                <div
                  class="grid transition-[grid-template-rows] duration-300 ease-in-out"
                  :style="{ gridTemplateRows: expandedOrder === (order.id || order.orderNumber) ? '1fr' : '0fr' }"
                >
                  <div class="overflow-hidden">
                    <div class="border-t border-slate-100">
                      <div v-if="isCancelled(order)" class="bg-rose-50 px-5 py-3">
                        <p class="text-xs font-medium text-rose-700">
                          This order was
                          {{ orderStatusKey(order) === 'REFUNDED' ? 'refunded' : orderStatusKey(order) === 'FAILED' ? 'not paid — payment failed' : 'cancelled' }}.
                        </p>
                      </div>

                      <div v-else class="px-5 py-5">
                        <p class="mb-4 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                          Order progress
                        </p>
                        <ol class="flex items-center gap-0">
                          <li v-for="(step, i) in timelineSteps(order)" :key="step.label" class="flex flex-1 items-center last:flex-none">
                            <div class="flex flex-col items-center">
                              <span
                                class="flex size-7 items-center justify-center rounded-full text-xs font-bold"
                                :class="
                                  step.state === 'done'
                                    ? 'bg-emerald-500 text-white'
                                    : step.state === 'active'
                                      ? 'bg-violet-600 text-white ring-4 ring-violet-100'
                                      : 'bg-slate-100 text-slate-400'
                                "
                              >
                                <CheckIcon v-if="step.state === 'done'" class="size-4" />
                                <template v-else>{{ i + 1 }}</template>
                              </span>
                              <span
                                class="mt-1.5 text-[10px] font-medium"
                                :class="step.state === 'upcoming' ? 'text-slate-400' : 'text-slate-700'"
                              >
                                {{ step.label }}
                              </span>
                            </div>
                            <div
                              v-if="i < 3"
                              class="mx-1 h-0.5 flex-1 self-start rounded-full"
                              :class="i < (TRACK_STEPS[orderStatusKey(order)] ?? 0) ? 'bg-emerald-500' : 'bg-slate-200'"
                              :style="{ marginTop: '14px' }"
                            ></div>
                          </li>
                        </ol>
                      </div>

                      <div class="divide-y divide-slate-100 px-5">
                        <div
                          v-for="item in orderItems(order)"
                          :key="item.productId || item.id"
                          class="flex items-center gap-4 py-3"
                        >
                          <img
                            :src="itemImage(item)"
                            :alt="item.name"
                            class="size-12 rounded-lg object-cover"
                            loading="lazy"
                          />
                          <div class="min-w-0 flex-1">
                            <p class="truncate text-sm font-medium text-slate-800">{{ item.name }}</p>
                            <p class="text-xs text-slate-500" v-if="item.variantLabel">{{ item.variantLabel }}</p>
                            <p class="text-xs text-slate-500">
                              {{ item.quantity }} × {{ currencySymbol }}{{ item.price }}
                            </p>
                          </div>
                          <div class="text-sm font-semibold text-slate-900">
                            {{ currencySymbol }}{{ (item.price * item.quantity).toFixed(2) }}
                          </div>
                        </div>
                      </div>

                      <div class="grid gap-4 border-t border-slate-100 px-5 py-4 text-xs text-slate-600 sm:grid-cols-3">
                        <div>
                          <p class="font-semibold uppercase tracking-wide text-slate-400">Payment</p>
                          <p class="mt-1 font-medium text-slate-800">
                            {{ paymentLabel(order) }}
                          </p>
                          <div class="mt-1"><OrderStatusBadge :status="paymentStatus(order)" /></div>
                        </div>
                        <div>
                          <p class="font-semibold uppercase tracking-wide text-slate-400">Delivery to</p>
                          <p class="mt-1 font-medium leading-relaxed text-slate-800">{{ shippingLabel(order) }}</p>
                        </div>
                        <div>
                          <p class="font-semibold uppercase tracking-wide text-slate-400">Summary</p>
                          <div class="mt-1 space-y-0.5 font-medium text-slate-800">
                            <p>Subtotal: {{ currencySymbol }}{{ (order.subtotal ?? order.total).toFixed(2) }}</p>
                            <p v-if="order.shippingCost !== undefined">
                              Delivery: {{ order.shippingCost === 0 ? 'Free' : currencySymbol + Number(order.shippingCost).toFixed(2) }}
                            </p>
                            <p class="font-bold">Total: {{ currencySymbol }}{{ (order.total || 0).toFixed(2) }}</p>
                          </div>
                        </div>
                      </div>

                      <div class="flex flex-wrap items-center gap-3 border-t border-slate-100 bg-slate-50/60 px-5 py-4">
                        <button
                          type="button"
                          class="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-500"
                          @click="buyAgain(order)"
                        >
                          <ArrowPathIcon class="size-4" />
                          Buy again
                        </button>
                        <NuxtLink
                          to="/contact"
                          class="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:border-violet-200 hover:text-violet-700"
                        >
                          <ChatBubbleLeftRightIcon class="size-4" />
                          Need help?
                        </NuxtLink>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            </div>

            <div v-else-if="!ordersSearch && ordersFilter === 'ALL'" class="mt-6 rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
              <div class="mx-auto flex size-16 items-center justify-center rounded-full bg-slate-100">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="size-8 text-slate-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25Z"
                  />
                </svg>
              </div>
              <p class="mt-4 text-lg font-semibold text-slate-800">No orders yet</p>
              <p class="mx-auto mt-1 max-w-sm text-sm text-slate-500">
                When you place an order, you'll be able to track its status and history here.
              </p>
              <NuxtLink
                to="/shop"
                class="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-violet-500"
              >
                Start shopping
              </NuxtLink>
            </div>

            <div v-else class="mt-6 rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
              <div class="mx-auto flex size-14 items-center justify-center rounded-full bg-slate-100">
                <MagnifyingGlassIcon class="size-7 text-slate-400" />
              </div>
              <p class="mt-4 text-base font-semibold text-slate-800">No matching orders</p>
              <p class="mx-auto mt-1 max-w-sm text-sm text-slate-500">
                Try a different search term or clear the active status filter.
              </p>
              <button
                type="button"
                class="mt-5 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                @click="ordersSearch = ''; ordersFilter = 'ALL'"
              >
                Clear filters
              </button>
            </div>
          </template>

          <template v-else-if="activeTab === 'addresses'">
            <div class="flex items-center justify-between gap-4">
              <div>
                <h1 class="text-2xl font-semibold text-slate-900">Saved addresses</h1>
                <p class="mt-1 text-sm text-slate-500">
                  Manage delivery addresses used at checkout.
                </p>
              </div>
              <button
                type="button"
                class="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-500"
                @click="openAddressModal()"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="size-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="2"
                  stroke="currentColor"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Add address
              </button>
            </div>

            <div v-if="addressesLoading" class="mt-6 grid gap-4 sm:grid-cols-2">
              <div v-for="i in 2" :key="i" class="h-40 animate-pulse rounded-2xl bg-slate-100"></div>
            </div>

            <div v-else-if="addresses.length" class="mt-6 grid gap-4 sm:grid-cols-2">
              <div
                v-for="address in addresses"
                :key="address.id"
                class="relative flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                :class="address.isDefault ? 'border-violet-300 ring-1 ring-violet-200' : ''"
              >
                <span
                  v-if="address.isDefault"
                  class="absolute right-4 top-4 rounded-full bg-violet-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-violet-700"
                >
                  Default
                </span>
                <p class="text-sm font-semibold text-slate-900">{{ address.fullName }}</p>
                <p class="mt-0.5 text-xs text-slate-500">{{ address.phone }}</p>
                <p class="mt-2 flex-1 text-sm leading-relaxed text-slate-600">
                  {{ address.address }}, {{ address.city }}
                </p>
                <p class="mt-1 text-xs text-slate-400">
                  {{ address.country }}{{ address.postalCode ? ` · ${address.postalCode}` : '' }}
                </p>
                <div class="mt-4 flex items-center gap-3 border-t border-slate-100 pt-3 text-sm">
                  <button
                    type="button"
                    class="font-semibold text-violet-700 transition hover:text-violet-500"
                    @click="openAddressModal(address)"
                  >
                    Edit
                  </button>
                  <button
                    v-if="!address.isDefault"
                    type="button"
                    class="font-medium text-slate-500 transition hover:text-violet-700"
                    @click="makeDefault(address)"
                  >
                    Set default
                  </button>
                  <button
                    type="button"
                    class="ml-auto font-medium text-rose-600 transition hover:text-rose-500"
                    @click="confirmDeleteAddress(address)"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>

            <div v-else class="mt-6 rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
              <div class="mx-auto flex size-16 items-center justify-center rounded-full bg-slate-100">
                <MapPinIcon class="size-8 text-slate-400" />
              </div>
              <p class="mt-4 text-lg font-semibold text-slate-800">No saved addresses</p>
              <p class="mx-auto mt-1 max-w-sm text-sm text-slate-500">
                Save your delivery addresses to check out faster next time.
              </p>
              <button
                type="button"
                class="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-violet-500"
                @click="openAddressModal()"
              >
                Add your first address
              </button>
            </div>
          </template>

          <template v-else>
            <h1 class="text-2xl font-semibold text-slate-900">Settings</h1>
            <p class="mt-1 text-sm text-slate-500">Update your personal information and security.</p>

            <div class="mt-6 grid gap-6 lg:grid-cols-2">
              <section class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 class="text-base font-semibold text-slate-900">Profile information</h2>
                <p class="mt-1 text-xs text-slate-500">
                  This information is used for shipping and order updates.
                </p>

                <form class="mt-5 space-y-4" @submit.prevent="saveProfile">
                  <div>
                    <label class="mb-1.5 block text-sm font-medium text-slate-700">Full name</label>
                    <input
                      v-model="profileForm.name"
                      type="text"
                      class="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                    />
                  </div>
                  <div>
                    <label class="mb-1.5 block text-sm font-medium text-slate-700">Phone</label>
                    <input
                      v-model="profileForm.phone"
                      type="tel"
                      placeholder="01XXXXXXXXX"
                      class="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                    />
                  </div>
                  <div>
                    <label class="mb-1.5 block text-sm font-medium text-slate-700">Email</label>
                    <input
                      :value="userStore.authenticatedUser?.email"
                      type="email"
                      disabled
                      class="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-500"
                    />
                    <p class="mt-1 text-xs text-slate-400">Email cannot be changed.</p>
                  </div>
                  <p v-if="profileMessage" class="text-sm" :class="profileError ? 'text-rose-600' : 'text-emerald-600'">
                    {{ profileMessage }}
                  </p>
                  <button
                    type="submit"
                    class="w-full rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-500 disabled:opacity-50"
                    :disabled="profileSaving"
                  >
                    {{ profileSaving ? 'Saving...' : 'Save changes' }}
                  </button>
                </form>
              </section>

              <section class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 class="text-base font-semibold text-slate-900">Change password</h2>
                <p class="mt-1 text-xs text-slate-500">
                  Choose a strong password you don't use elsewhere.
                </p>

                <form class="mt-5 space-y-4" @submit.prevent="savePassword">
                  <div>
                    <label class="mb-1.5 block text-sm font-medium text-slate-700">Current password</label>
                    <input
                      v-model="passwordForm.current"
                      type="password"
                      autocomplete="current-password"
                      class="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                    />
                  </div>
                  <div>
                    <label class="mb-1.5 block text-sm font-medium text-slate-700">New password</label>
                    <input
                      v-model="passwordForm.next"
                      type="password"
                      autocomplete="new-password"
                      class="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                    />
                  </div>
                  <div>
                    <label class="mb-1.5 block text-sm font-medium text-slate-700">Confirm new password</label>
                    <input
                      v-model="passwordForm.confirm"
                      type="password"
                      autocomplete="new-password"
                      class="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                    />
                  </div>
                  <p v-if="passwordMessage" class="text-sm" :class="passwordError ? 'text-rose-600' : 'text-emerald-600'">
                    {{ passwordMessage }}
                  </p>
                  <button
                    type="submit"
                    class="w-full rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-500 disabled:opacity-50"
                    :disabled="passwordSaving"
                  >
                    {{ passwordSaving ? 'Updating...' : 'Update password' }}
                  </button>
                </form>
              </section>
            </div>
          </template>
        </section>
      </div>

      <AppModal
        :is-open="addressModalOpen"
        :title="editingAddress ? 'Edit address' : 'Add address'"
        max-width="max-w-lg"
        @handle-modal="closeAddressModal"
      >
        <form class="space-y-4" @submit.prevent="saveAddress">
          <div>
            <label class="mb-1.5 block text-sm font-medium text-slate-700">Full name</label>
            <input
              v-model="addressForm.fullName"
              type="text"
              required
              class="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
            />
          </div>
          <div>
            <label class="mb-1.5 block text-sm font-medium text-slate-700">Phone</label>
            <input
              v-model="addressForm.phone"
              type="tel"
              required
              placeholder="01XXXXXXXXX"
              class="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
            />
          </div>
          <div>
            <label class="mb-1.5 block text-sm font-medium text-slate-700">Address</label>
            <input
              v-model="addressForm.address"
              type="text"
              required
              placeholder="House, street, area"
              class="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
            />
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="mb-1.5 block text-sm font-medium text-slate-700">City</label>
              <input
                v-model="addressForm.city"
                type="text"
                required
                class="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
              />
            </div>
            <div>
              <label class="mb-1.5 block text-sm font-medium text-slate-700">Postal code</label>
              <input
                v-model="addressForm.postalCode"
                type="text"
                class="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
              />
            </div>
          </div>
          <label class="flex items-center gap-2 text-sm text-slate-700">
            <input v-model="addressForm.isDefault" type="checkbox" class="rounded border-slate-300" />
            Set as default address
          </label>
          <p v-if="addressError" class="text-sm text-rose-600">{{ addressError }}</p>
          <div class="flex gap-3 pt-2">
            <button
              type="submit"
              class="flex-1 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-500 disabled:opacity-50"
              :disabled="addressSaving"
            >
              {{ addressSaving ? 'Saving...' : 'Save address' }}
            </button>
            <button
              type="button"
              class="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              @click="closeAddressModal"
            >
              Cancel
            </button>
          </div>
        </form>
      </AppModal>

      <AppConfirmModal
        :is-open="deleteModal.open"
        title="Remove address"
        :message="`Are you sure you want to remove the address for ${deleteModal.name}?`"
        confirm-text="Remove"
        variant="danger"
        @confirm="confirmDelete"
        @cancel="deleteModal.open = false"
      />
    </main>
  </ClientOnly>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import { storeToRefs } from "pinia";
import { useRoute, useRouter } from "vue-router";
import {
  ArrowPathIcon,
  ArrowRightStartOnRectangleIcon,
  ChatBubbleLeftRightIcon,
  CheckIcon,
  ClipboardDocumentListIcon,
  Cog6ToothIcon,
  HeartIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
  Squares2X2Icon,
  UserCircleIcon,
} from "@heroicons/vue/24/outline";
import { useUserStore } from "~/stores/user";
import { useFavoriteStore } from "~/stores/favorite";
import { useCatalogStore } from "~/stores/catalog";
import { useCartStore } from "~/stores/cart";
import { useRuntimeConfig } from "#app";
import type { Address, AddressInput } from "~/types/account";

definePageMeta({ middleware: "auth" });

useSeo({
  title: "My Account",
  noindex: true,
});

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const favoriteStore = useFavoriteStore();
const catalogStore = useCatalogStore();
const cartStore = useCartStore();
await catalogStore.hydrate();

const currencySymbol = useRuntimeConfig().public.currencySymbol || "Tk";
const { resolve } = useImageUrl();

const tabs = [
  { id: "overview", label: "Overview", icon: UserCircleIcon },
  { id: "orders", label: "Orders", icon: ClipboardDocumentListIcon },
  { id: "addresses", label: "Addresses", icon: MapPinIcon },
  { id: "settings", label: "Settings", icon: Cog6ToothIcon },
];

const activeTab = computed(() => {
  const query = route.query.tab;
  const value = typeof query === "string" ? query : "";
  return tabs.some((t) => t.id === value) ? value : "overview";
});

const setTab = (id: string) => {
  router.replace({ query: { ...route.query, tab: id } });
};

const firstName = computed(() => {
  const name = userStore.authenticatedUser?.name?.trim();
  if (name) return name.split(/\s+/)[0];
  return (userStore.authenticatedUser?.email || "").split("@")[0] || "there";
});

const { orders, addresses, profileLoading, ordersLoading, addressesLoading } = storeToRefs(userStore);

const totalSpent = computed(() =>
  orders.value.reduce((sum, order) => sum + Number(order.total || 0), 0)
);
const recentOrders = computed(() => orders.value.slice(0, 3));

const quickActions = [
  { label: "Browse shop", to: "/shop", icon: Squares2X2Icon },
  { label: "My favorites", to: "/favorite", icon: HeartIcon },
  { label: "Saved addresses", to: "/profile?tab=addresses", icon: MapPinIcon },
  { label: "Account settings", to: "/profile?tab=settings", icon: Cog6ToothIcon },
];

const formatDate = (value?: string) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

const memberSince = computed(() => {
  const created = userStore.authenticatedUser?.createdAt;
  if (!created) return "";
  const date = new Date(created);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
});

const orderItems = (order: any) => order.items || [];

const itemImage = (item: any) => {
  if (item.image) return resolve(item.image) || "/nutri.png";
  const product = catalogStore.productById(item.productId || item.id);
  return resolve(product?.image) || "/nutri.png";
};

const paymentLabel = (order: any) => {
  const method = order.paymentMethod || order.payment?.method;
  if (!method) return "Payment info";
  return String(method).replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
};

const paymentStatus = (order: any) =>
  order.paymentStatus || order.payment?.status || "PENDING";

const shippingLabel = (order: any) => {
  const name = order.shippingName || order.shipping?.fullName;
  const city = order.shippingCity || order.shipping?.city;
  const address = order.shippingAddress || order.shipping?.address;
  return [name, address, city].filter(Boolean).join(", ") || "—";
};

const expandedOrder = ref<string>("");
const toggleOrder = (order: any) => {
  const key = order.id || order.orderNumber;
  expandedOrder.value = expandedOrder.value === key ? "" : key;
};

const ordersSearch = ref("");
const ordersFilter = ref("ALL");

const orderStatusKey = (order: any) =>
  String(order.status || order.order?.status || "PENDING").toUpperCase();

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  REFUNDED: "Refunded",
  FAILED: "Payment failed",
};

const statusLabel = (key: string) => STATUS_LABELS[key] || key.replace(/_/g, " ");

const statusOptions = computed(() => {
  const counts = new Map<string, number>();
  for (const order of orders.value) {
    const key = orderStatusKey(order);
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  const options = Array.from(counts.entries()).map(([key, count]) => ({
    key,
    label: statusLabel(key),
    count,
  }));
  options.sort((a, b) => b.count - a.count);
  return [
    { key: "ALL", label: "All", count: orders.value.length },
    ...options,
  ];
});

const filteredOrders = computed(() => {
  const query = ordersSearch.value.trim().toLowerCase();
  return orders.value.filter((order) => {
    const key = orderStatusKey(order);
    if (ordersFilter.value !== "ALL" && key !== ordersFilter.value) return false;
    if (query) {
      const ref = String(order.orderNumber || order.id || "").toLowerCase();
      if (!ref.includes(query)) return false;
    }
    return true;
  });
});

const orderThumbnails = (order: any) => {
  const items = orderItems(order);
  const seen = new Set<string>();
  const list: any[] = [];
  for (const item of items) {
    if (seen.has(item.productId || item.id)) continue;
    seen.add(item.productId || item.id);
    if (list.length >= 4) break;
    list.push(item);
  }
  return list;
};

const itemsText = (order: any) => {
  const count = orderItems(order).length;
  return `${count} item${count === 1 ? "" : "s"}`;
};

const TRACK_STEPS: Record<string, number> = {
  PENDING: 0,
  CONFIRMED: 1,
  PROCESSING: 1,
  SHIPPED: 2,
  DELIVERED: 3,
};

const timelineSteps = (order: any) => {
  const key = orderStatusKey(order);
  const active = TRACK_STEPS[key] ?? 0;
  return ["Placed", "Confirmed", "Shipped", "Delivered"].map((label, i) => ({
    label,
    state: i < active ? "done" : i === active ? "active" : "upcoming",
  }));
};

const isCancelled = (order: any) => {
  const key = orderStatusKey(order);
  return key === "CANCELLED" || key === "REFUNDED" || key === "FAILED";
};

const buyAgain = (order: any) => {
  for (const item of orderItems(order)) {
    const product = catalogStore.productById(item.productId || item.id);
    const payload: any = {
      productId: item.productId || item.id,
      price: item.price,
      name: item.name,
      image: product?.image || item.image || "/nutri.png",
      unit: item.unit,
      variantLabel: item.variantLabel,
      _variant: null,
    };
    if (item.variantId) payload.variantId = item.variantId;
    cartStore.addToCart(payload, item.quantity ?? 1);
  }
  cartStore.toggleCart();
};

const handleLogout = () => {
  userStore.logoutUser();
  router.push("/");
};

const profileForm = reactive({ name: "", phone: "" });
const profileSaving = ref(false);
const profileMessage = ref("");
const profileError = ref(false);
const saveProfile = async () => {
  profileSaving.value = true;
  profileMessage.value = "";
  profileError.value = false;
  try {
    await userStore.updateProfile({
      name: profileForm.name.trim(),
      phone: profileForm.phone.trim(),
    });
    profileMessage.value = "Profile updated successfully.";
  } catch (error: any) {
    profileError.value = true;
    profileMessage.value = error?.data?.message || error?.message || "Failed to update profile.";
  } finally {
    profileSaving.value = false;
  }
};

const passwordForm = reactive({ current: "", next: "", confirm: "" });
const passwordSaving = ref(false);
const passwordMessage = ref("");
const passwordError = ref(false);
const savePassword = async () => {
  passwordMessage.value = "";
  passwordError.value = false;
  if (!passwordForm.current) {
    passwordError.value = true;
    passwordMessage.value = "Enter your current password.";
    return;
  }
  if (passwordForm.next.length < 6) {
    passwordError.value = true;
    passwordMessage.value = "New password must be at least 6 characters.";
    return;
  }
  if (passwordForm.next !== passwordForm.confirm) {
    passwordError.value = true;
    passwordMessage.value = "Passwords do not match.";
    return;
  }
  passwordSaving.value = true;
  try {
    await userStore.changePassword({
      currentPassword: passwordForm.current,
      newPassword: passwordForm.next,
    });
    passwordMessage.value = "Password updated successfully.";
    passwordForm.current = "";
    passwordForm.next = "";
    passwordForm.confirm = "";
  } catch (error: any) {
    passwordError.value = true;
    passwordMessage.value = error?.data?.message || error?.message || "Failed to update password.";
  } finally {
    passwordSaving.value = false;
  }
};

const addressModalOpen = ref(false);
const editingAddress = ref<Address | null>(null);
const addressSaving = ref(false);
const addressError = ref("");
const addressForm = reactive<AddressInput>({
  fullName: "",
  phone: "",
  address: "",
  city: "",
  postalCode: "",
  country: "Bangladesh",
  isDefault: false,
});

const resetAddressForm = () => {
  editingAddress.value = null;
  addressError.value = "";
  addressForm.fullName = "";
  addressForm.phone = "";
  addressForm.address = "";
  addressForm.city = "";
  addressForm.postalCode = "";
  addressForm.country = "Bangladesh";
  addressForm.isDefault = false;
};

const openAddressModal = (address?: Address) => {
  resetAddressForm();
  if (address) {
    editingAddress.value = address;
    addressForm.fullName = address.fullName;
    addressForm.phone = address.phone;
    addressForm.address = address.address;
    addressForm.city = address.city;
    addressForm.postalCode = address.postalCode || "";
    addressForm.country = address.country || "Bangladesh";
    addressForm.isDefault = !!address.isDefault;
  }
  addressModalOpen.value = true;
};

const closeAddressModal = () => {
  addressModalOpen.value = false;
  resetAddressForm();
};

const saveAddress = async () => {
  addressSaving.value = true;
  addressError.value = "";
  try {
    await userStore.saveAddress(
      {
        fullName: addressForm.fullName.trim(),
        phone: addressForm.phone.trim(),
        address: addressForm.address.trim(),
        city: addressForm.city.trim(),
        postalCode: addressForm.postalCode.trim(),
        country: addressForm.country || "Bangladesh",
        isDefault: addressForm.isDefault,
      },
      editingAddress.value?.id
    );
    closeAddressModal();
  } catch (error: any) {
    addressError.value = error?.data?.message || error?.message || "Failed to save address.";
  } finally {
    addressSaving.value = false;
  }
};

const makeDefault = async (address: Address) => {
  try {
    await userStore.saveAddress({ ...address, isDefault: true }, address.id);
  } catch (error) {
    console.error("Failed to set default address", error);
  }
};

const deleteModal = reactive({ open: false, id: "", name: "" });
const confirmDeleteAddress = (address: Address) => {
  deleteModal.id = address.id;
  deleteModal.name = address.fullName;
  deleteModal.open = true;
};
const confirmDelete = async () => {
  if (deleteModal.id) {
    await userStore.deleteAddress(deleteModal.id);
  }
  deleteModal.open = false;
  deleteModal.id = "";
};

onMounted(async () => {
  userStore.loadAuthenticatedUser();
  await catalogStore.hydrate();
  favoriteStore.loadFavorites();
  userStore.fetchProfile();
  userStore.fetchOrders();
  userStore.fetchAddresses();

  const user = userStore.authenticatedUser;
  if (user) {
    profileForm.name = user.name || "";
    profileForm.phone = user.phone || "";
  }
});
</script>
