<template>
  <main class="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
    <div class="w-full max-w-sm">
      <div class="mb-8 text-center">
        <NuxtLink to="/" class="inline-flex items-center gap-2 text-lg font-semibold text-violet-700">
          <span class="inline-flex h-9 w-9 items-center justify-center rounded-full bg-violet-600 text-sm font-bold text-white">NZ</span>
          NutriZaria
        </NuxtLink>
      </div>

      <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div class="mb-6">
          <h1 class="text-xl font-semibold text-slate-900">Welcome back</h1>
          <p class="mt-1 text-sm text-slate-500">Sign in to your account to continue</p>
        </div>

        <div class="mb-6 grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1" role="tablist" aria-label="Sign in options">
          <button
            type="button"
            role="tab"
            :aria-selected="activeTab === 'phone'"
            class="rounded-lg px-4 py-2 text-sm font-semibold transition"
            :class="activeTab === 'phone' ? 'bg-white text-violet-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'"
            @click="activeTab = 'phone'"
          >
            Phone
          </button>
          <button
            type="button"
            role="tab"
            :aria-selected="activeTab === 'email'"
            class="rounded-lg px-4 py-2 text-sm font-semibold transition"
            :class="activeTab === 'email' ? 'bg-white text-violet-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'"
            @click="activeTab = 'email'"
          >
            Email
          </button>
        </div>

        <!-- Phone OTP tab (primary) -->
        <div v-if="activeTab === 'phone' && !showCompleteProfile" class="space-y-4">
          <!-- Step 1: Phone number input -->
          <div v-if="!otpSent && !showPhonePassword">
            <label for="login-phone" class="mb-1.5 block text-sm font-medium text-slate-700">Phone number</label>
            <div class="flex gap-2">
              <span class="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-500">
                <svg class="size-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
                </svg>
                +880
              </span>
              <input
                id="login-phone"
                v-model="phoneNumber"
                type="tel"
                inputmode="numeric"
                maxlength="14"
                autocomplete="tel"
                placeholder="1XXXXXXXXXX"
                class="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                :class="{ 'border-red-300 focus:border-red-500 focus:ring-red-500/20': errors.phone }"
                @input="phoneNumber = phoneNumber.replace(/[^\d+]/g, '')"
                @keyup.enter="handleCheckPhone"
              />
            </div>
            <p v-if="errors.phone" class="mt-1 text-xs text-red-600">{{ errors.phone }}</p>
            <p v-else class="mt-1 text-xs text-slate-400">
              Enter your phone number to continue.
            </p>
          </div>

          <!-- Step 2a: Password login (existing user with password) -->
          <div v-if="showPhonePassword && !otpSent">
            <div class="mb-4 flex items-center gap-3 rounded-lg bg-slate-50 px-3 py-2.5">
              <span class="inline-flex h-8 w-8 items-center justify-center rounded-full bg-violet-100 text-xs font-semibold text-violet-600">
                {{ phoneUserName?.charAt(0)?.toUpperCase() || 'U' }}
              </span>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-slate-900 truncate">{{ phoneUserName || 'Welcome back' }}</p>
                <p class="text-xs text-slate-500">{{ normalizePhone(phoneNumber) }}</p>
              </div>
              <button type="button" class="text-xs font-medium text-slate-400 hover:text-slate-600" @click="resetOtpFlow">
                Change
              </button>
            </div>

            <label for="login-phone-password" class="mb-1.5 block text-sm font-medium text-slate-700">Password</label>
            <div class="relative">
              <input
                id="login-phone-password"
                v-model="phonePassword"
                :type="showPhonePasswordField ? 'text' : 'password'"
                autocomplete="current-password"
                placeholder="Enter your password"
                class="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 pr-10 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                :class="{ 'border-red-300 focus:border-red-500 focus:ring-red-500/20': errors.phonePassword }"
                @keyup.enter="handlePhonePasswordLogin"
              />
              <button
                type="button"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                @click="showPhonePasswordField = !showPhonePasswordField"
                :aria-label="showPhonePasswordField ? 'Hide password' : 'Show password'"
                tabindex="-1"
              >
                <svg v-if="!showPhonePasswordField" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/>
                </svg>
                <svg v-else class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"/>
                </svg>
              </button>
            </div>
            <p v-if="errors.phonePassword" class="mt-1 text-xs text-red-600">{{ errors.phonePassword }}</p>
          </div>

          <!-- Step 2b: OTP verification (new user or no password) -->
          <div v-if="otpSent">
            <div class="mb-4 flex items-center gap-3 rounded-lg bg-slate-50 px-3 py-2.5">
              <span class="inline-flex h-8 w-8 items-center justify-center rounded-full bg-violet-100">
                <svg class="h-4 w-4 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
                </svg>
              </span>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-slate-900">New account</p>
                <p class="text-xs text-slate-500">{{ normalizePhone(phoneNumber) }}</p>
              </div>
              <button type="button" class="text-xs font-medium text-slate-400 hover:text-slate-600" @click="resetOtpFlow">
                Change
              </button>
            </div>

            <label for="login-otp" class="mb-1.5 block text-sm font-medium text-slate-700">Verification code</label>
            <input
              id="login-otp"
              v-model="otp"
              type="text"
              inputmode="numeric"
              maxlength="6"
              placeholder="6-digit code"
              class="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-center text-lg tracking-[0.5em] text-slate-900 outline-none transition placeholder:text-sm placeholder:tracking-normal placeholder:text-slate-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
              :class="{ 'border-red-300 focus:border-red-500 focus:ring-red-500/20': errors.otp }"
              @keyup.enter="handleVerifyOtp"
            />
            <p v-if="errors.otp" class="mt-1 text-xs text-red-600">{{ errors.otp }}</p>
            <p class="mt-1 text-xs text-slate-500">
              Code sent to {{ normalizePhone(phoneNumber) || '+880' + phoneNumber }}
            </p>
          </div>

          <div v-if="errorMessage" class="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {{ errorMessage }}
          </div>

          <!-- Continue button (check phone) -->
          <button
            v-if="!otpSent && !showPhonePassword"
            type="button"
            class="w-full rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700 active:bg-violet-800 disabled:cursor-not-allowed disabled:opacity-50"
            :disabled="checkingPhone"
            @click="handleCheckPhone"
          >
            <span v-if="checkingPhone" class="inline-flex items-center gap-2">
              <svg class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
              Checking...
            </span>
            <span v-else>Continue</span>
          </button>

          <!-- Sign in with password button -->
          <button
            v-if="showPhonePassword && !otpSent"
            type="button"
            class="w-full rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700 active:bg-violet-800 disabled:cursor-not-allowed disabled:opacity-50"
            :disabled="loggingInWithPassword"
            @click="handlePhonePasswordLogin"
          >
            <span v-if="loggingInWithPassword" class="inline-flex items-center gap-2">
              <svg class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
              Signing in...
            </span>
            <span v-else>Sign in</span>
          </button>

          <!-- Use OTP instead link -->
          <div v-if="showPhonePassword && !otpSent" class="text-center">
            <button type="button" class="text-xs font-medium text-violet-600 hover:text-violet-700" @click="handleSendOtp">
              Use verification code instead
            </button>
          </div>

          <!-- Verify OTP button -->
          <button
            v-if="otpSent"
            type="button"
            class="w-full rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700 active:bg-violet-800 disabled:cursor-not-allowed disabled:opacity-50"
            :disabled="verifyingOtp"
            @click="handleVerifyOtp"
          >
            <span v-if="verifyingOtp" class="inline-flex items-center gap-2">
              <svg class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
              Verifying...
            </span>
            <span v-else>Verify & sign in</span>
          </button>

          <div v-if="otpSent" class="flex items-center justify-between text-xs text-slate-500">
            <span>
              Didn't get the code?
              <button
                v-if="otpCooldown === 0"
                type="button"
                class="font-semibold text-violet-600 hover:text-violet-700"
                @click="handleSendOtp"
              >
                Resend code
              </button>
              <span v-else>Resend in {{ otpCooldown }}s</span>
            </span>
            <button type="button" class="font-medium text-slate-400 hover:text-slate-600" @click="resetOtpFlow">
              Change number
            </button>
          </div>
        </div>

        <!-- Complete Profile form (shown after OTP when setup required) -->
        <div v-if="showCompleteProfile" class="space-y-4">
          <div class="rounded-lg bg-violet-50 px-4 py-3">
            <p class="text-sm font-medium text-violet-900">Complete your profile</p>
            <p class="mt-0.5 text-xs text-violet-700">Set up your name and password to finish signing in.</p>
          </div>

          <div>
            <label for="setup-phone" class="mb-1.5 block text-sm font-medium text-slate-700">Phone number</label>
            <input
              id="setup-phone"
              :value="setupPhone"
              type="tel"
              disabled
              class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-600"
            />
          </div>

          <div>
            <label for="setup-name" class="mb-1.5 block text-sm font-medium text-slate-700">Full name</label>
            <input
              id="setup-name"
              v-model="setupName"
              type="text"
              autocomplete="name"
              placeholder="Enter your full name"
              class="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
              :class="{ 'border-red-300 focus:border-red-500 focus:ring-red-500/20': errors.name }"
            />
            <p v-if="errors.name" class="mt-1 text-xs text-red-600">{{ errors.name }}</p>
          </div>

          <div>
            <label for="setup-password" class="mb-1.5 block text-sm font-medium text-slate-700">Password</label>
            <input
              id="setup-password"
              v-model="setupPassword"
              type="password"
              autocomplete="new-password"
              placeholder="Create a password (min 6 characters)"
              class="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
              :class="{ 'border-red-300 focus:border-red-500 focus:ring-red-500/20': errors.setupPassword }"
            />
            <p v-if="errors.setupPassword" class="mt-1 text-xs text-red-600">{{ errors.setupPassword }}</p>
          </div>

          <div v-if="errorMessage" class="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {{ errorMessage }}
          </div>

          <button
            type="button"
            class="w-full rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700 active:bg-violet-800 disabled:cursor-not-allowed disabled:opacity-50"
            :disabled="completingProfile"
            @click="handleCompleteProfile"
          >
            <span v-if="completingProfile" class="inline-flex items-center gap-2">
              <svg class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
              Setting up your account...
            </span>
            <span v-else>Complete profile & sign in</span>
          </button>
        </div>

        <!-- Email tab (secondary) -->
        <form v-else-if="activeTab === 'email'" class="space-y-4" @submit.prevent="handleLogin">
          <div>
            <label for="login-email" class="mb-1.5 block text-sm font-medium text-slate-700">Email</label>
            <input
              id="login-email"
              v-model="email"
              type="email"
              required
              autocomplete="email"
              placeholder="you@example.com"
              class="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
              :class="{ 'border-red-300 focus:border-red-500 focus:ring-red-500/20': errors.email }"
            />
            <p v-if="errors.email" class="mt-1 text-xs text-red-600">{{ errors.email }}</p>
          </div>

          <div>
            <label for="login-password" class="mb-1.5 block text-sm font-medium text-slate-700">Password</label>
            <div class="relative">
              <input
                id="login-password"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                required
                autocomplete="current-password"
                placeholder="Enter your password"
                class="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 pr-10 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                :class="{ 'border-red-300 focus:border-red-500 focus:ring-red-500/20': errors.password }"
              />
              <button
                type="button"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                @click="showPassword = !showPassword"
                :aria-label="showPassword ? 'Hide password' : 'Show password'"
                tabindex="-1"
              >
                <svg v-if="!showPassword" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/>
                </svg>
                <svg v-else class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"/>
                </svg>
              </button>
            </div>
            <p v-if="errors.password" class="mt-1 text-xs text-red-600">{{ errors.password }}</p>
          </div>

          <div v-if="errorMessage" class="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {{ errorMessage }}
          </div>

          <button
            type="submit"
            class="w-full rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700 active:bg-violet-800 disabled:cursor-not-allowed disabled:opacity-50"
            :disabled="loading"
          >
            <span v-if="loading" class="inline-flex items-center gap-2">
              <svg class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
              Signing in...
            </span>
            <span v-else>Sign in</span>
          </button>
        </form>

        <div class="my-5 flex items-center gap-3">
          <div class="h-px flex-1 bg-slate-200"></div>
          <span class="text-xs text-slate-500">or</span>
          <div class="h-px flex-1 bg-slate-200"></div>
        </div>

        <button
          type="button"
          class="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 active:bg-slate-100"
          @click="handleGoogleLogin"
        >
          <svg class="h-4 w-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>
        <div id="recaptcha-container"></div>
      </div>

      <p class="mt-6 text-center text-sm text-slate-500">
        Don't have an account?
        <NuxtLink to="/signup" class="font-medium text-violet-600 hover:text-violet-700">Create one</NuxtLink>
      </p>
    </div>
  </main>
</template>

<script setup lang="ts">
import { computed, ref, reactive, onBeforeUnmount } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useUserStore } from "~/stores/user";
import { useAuth } from "~/composables/useAuth";

definePageMeta({ layout: false, middleware: "guest" });

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();
const { sendOTP, verifyOtp, loginWithGoogle } = useAuth();

const redirectTo = computed(() => {
  const target = route.query.redirect;
  return typeof target === "string" && target.startsWith("/")
    ? target
    : "/";
});

const activeTab = ref<"phone" | "email">("phone");

const email = ref("");
const password = ref("");
const showPassword = ref(false);
const loading = ref(false);
const errorMessage = ref("");
const errors = reactive({ email: "", password: "", phone: "", otp: "", name: "", setupPassword: "", phonePassword: "" });

const phoneNumber = ref("");
const otp = ref("");
const otpSent = ref(false);
const sendingOtp = ref(false);
const verifyingOtp = ref(false);
const otpCooldown = ref(0);
let confirmationResult: any = null;
let cooldownTimer: ReturnType<typeof setInterval> | null = null;

const showCompleteProfile = ref(false);
const setupToken = ref("");
const setupPhone = ref("");
const setupName = ref("");
const setupPassword = ref("");
const completingProfile = ref(false);

const phoneChecked = ref(false);
const phoneExists = ref(false);
const phoneHasPassword = ref(false);
const phoneUserName = ref<string | null>(null);
const checkingPhone = ref(false);
const phonePassword = ref("");
const showPhonePassword = ref(false);
const showPhonePasswordField = ref(false);
const loggingInWithPassword = ref(false);

useSeo({
  title: "Login",
  description: "Sign in to your NutriZaria account.",
  noindex: true,
});

onBeforeUnmount(() => {
  if (cooldownTimer) clearInterval(cooldownTimer);
});

const startCooldown = (seconds = 60) => {
  otpCooldown.value = seconds;
  if (cooldownTimer) clearInterval(cooldownTimer);
  cooldownTimer = setInterval(() => {
    otpCooldown.value -= 1;
    if (otpCooldown.value <= 0) {
      if (cooldownTimer) clearInterval(cooldownTimer);
    }
  }, 1000);
};

const normalizePhone = (raw: string) => {
  let s = String(raw || "").replace(/[\s\-()+]/g, "");
  if (s.startsWith("880")) s = s.slice(3); // strip country code if included
  if (s.startsWith("0")) s = s.slice(1); // strip the national leading 0
  if (!/^\d{10}$/.test(s) || !s.startsWith("1")) return "";
  if (!"3456789".includes(s[1])) return ""; // valid BD operator (13–19)
  return `+880${s}`;
};

const validatePhone = () => {
  errors.phone = "";
  if (!phoneNumber.value.trim()) {
    errors.phone = "Enter your phone number";
    return false;
  }
  if (!normalizePhone(phoneNumber.value)) {
    errors.phone = "That doesn't look like a valid Bangladeshi number";
    return false;
  }
  return true;
};

const handleCheckPhone = async () => {
  errorMessage.value = "";
  if (!validatePhone()) return;

  checkingPhone.value = true;
  try {
    const normalizedPhone = normalizePhone(phoneNumber.value);
    const result = await userStore.checkPhone(normalizedPhone);
    phoneChecked.value = true;
    phoneExists.value = result.exists;
    phoneHasPassword.value = result.hasPassword;
    phoneUserName.value = result.name;

    if (result.exists && result.hasPassword) {
      showPhonePassword.value = true;
      phonePassword.value = "";
      errors.phonePassword = "";
    } else {
      // New user or no password — proceed to OTP
      showPhonePassword.value = false;
      await handleSendOtp();
    }
  } catch (err: any) {
    errorMessage.value = err?.message || "Could not check phone number. Please try again.";
  } finally {
    checkingPhone.value = false;
  }
};

const handlePhonePasswordLogin = async () => {
  errorMessage.value = "";
  errors.phonePassword = "";

  if (!phonePassword.value) {
    errors.phonePassword = "Enter your password";
    return;
  }

  loggingInWithPassword.value = true;
  try {
    const normalizedPhone = normalizePhone(phoneNumber.value);
    const ok = await userStore.phonePasswordLogin(normalizedPhone, phonePassword.value);
    if (ok) {
      router.push(redirectTo.value);
    } else {
      errors.phonePassword = "Invalid password. Please try again.";
    }
  } catch (err: any) {
    errorMessage.value = err?.message || "Login failed. Please try again.";
  } finally {
    loggingInWithPassword.value = false;
  }
};

const handleSendOtp = async () => {
  errorMessage.value = "";
  if (!validatePhone()) return;

  sendingOtp.value = true;
  try {
    confirmationResult = await sendOTP(
      normalizePhone(phoneNumber.value),
      "recaptcha-container"
    );
    otpSent.value = true;
    otp.value = "";
    errors.otp = "";
    startCooldown(60);
  } catch (err: any) {
    const code = err?.code || "";
    if (code === "auth/invalid-phone-number") {
      errorMessage.value = "Please enter a valid phone number.";
    } else if (code === "auth/too-many-requests") {
      errorMessage.value = "Too many attempts. Please try again later.";
    } else if (code === "auth/quota-exceeded") {
      errorMessage.value = "OTP service is temporarily unavailable. Please try again later.";
    } else {
      errorMessage.value =
        err?.message || "Could not send the code. Please try again.";
    }
  } finally {
    sendingOtp.value = false;
  }
};

const handleVerifyOtp = async () => {
  errorMessage.value = "";
  errors.otp = "";

  if (!/^\d{6}$/.test(otp.value.trim())) {
    errors.otp = "Enter the 6-digit code";
    return;
  }
  if (!confirmationResult) {
    errorMessage.value = "Please request a new code.";
    resetOtpFlow();
    return;
  }

  verifyingOtp.value = true;
  try {
    const firebaseUser = await verifyOtp(confirmationResult, otp.value.trim());
    const idToken = await firebaseUser.getIdToken();
    const phone = firebaseUser.phoneNumber || normalizePhone(phoneNumber.value);

    const result = await userStore.phoneLogin(idToken, phone);
    if (result?.requiresSetup) {
      showCompleteProfile.value = true;
      setupToken.value = result.setupToken;
      setupPhone.value = result.phone || phone;
      setupName.value = "";
      setupPassword.value = "";
    } else if (result?.success) {
      router.push(redirectTo.value);
    } else {
      errorMessage.value = "Could not sign in. Please try again.";
    }
  } catch (err: any) {
    const code = err?.code || "";
    if (code === "auth/invalid-verification-code") {
      errors.otp = "Incorrect code. Please check and try again.";
    } else if (code === "auth/code-expired") {
      errorMessage.value = "The code has expired. Please request a new one.";
      resetOtpFlow();
    } else {
      errorMessage.value = err?.message || "Verification failed. Please try again.";
    }
  } finally {
    verifyingOtp.value = false;
  }
};

const resetOtpFlow = () => {
  otpSent.value = false;
  otp.value = "";
  confirmationResult = null;
  errors.otp = "";
  if (cooldownTimer) clearInterval(cooldownTimer);
  otpCooldown.value = 0;
  phoneChecked.value = false;
  phoneExists.value = false;
  phoneHasPassword.value = false;
  phoneUserName.value = null;
  showPhonePassword.value = false;
  phonePassword.value = "";
  errors.phonePassword = "";
};

const handleCompleteProfile = async () => {
  errorMessage.value = "";
  errors.name = "";
  errors.setupPassword = "";

  if (!setupName.value.trim() || setupName.value.trim().length < 2) {
    errors.name = "Name must be at least 2 characters";
    return;
  }
  if (!setupPassword.value || setupPassword.value.length < 6) {
    errors.setupPassword = "Password must be at least 6 characters";
    return;
  }

  completingProfile.value = true;
  try {
    const ok = await userStore.completeProfile({
      setupToken: setupToken.value,
      name: setupName.value.trim(),
      password: setupPassword.value,
    });
    if (ok) {
      router.push(redirectTo.value);
    } else {
      errorMessage.value = "Could not complete profile setup. Please try again.";
    }
  } catch (err: any) {
    errorMessage.value = err?.message || "Profile setup failed. Please try again.";
  } finally {
    completingProfile.value = false;
  }
};

const validate = () => {
  errors.email = "";
  errors.password = "";
  let valid = true;

  if (!email.value) {
    errors.email = "Email is required";
    valid = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    errors.email = "Enter a valid email address";
    valid = false;
  }

  if (!password.value) {
    errors.password = "Password is required";
    valid = false;
  }

  return valid;
};

const handleLogin = async () => {
  errorMessage.value = "";
  if (!validate()) return;

  loading.value = true;
  try {
    const success = await userStore.loginUser({
      email: email.value,
      password: password.value,
    });

    if (success) {
      router.push(redirectTo.value);
    } else {
      errorMessage.value = "Invalid email or password";
    }
  } catch (err) {
    errorMessage.value = "Something went wrong. Please try again.";
  } finally {
    loading.value = false;
  }
};

const handleGoogleLogin = async () => {
  errorMessage.value = "";
  try {
    const ok = await loginWithGoogle();
    if (!ok) return;
    router.push(redirectTo.value);
  } catch (err) {
    errorMessage.value = "Google sign-in failed. Please try again.";
  }
};
</script>
