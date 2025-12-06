<template>
  <form
    @submit.prevent="handleSubmit"
    class="space-y-6"
    novalidate
  >
    <div class="grid gap-4 md:grid-cols-2">
      <label class="space-y-1 text-sm text-slate-600">
        Full Name
        <input
          v-model="form.fullName"
          type="text"
          name="full-name"
          autocomplete="name"
          class="w-full rounded-xl border border-slate-200 px-4 py-3 text-base text-slate-800 transition focus:border-violet-500 focus:outline-none"
        />
        <span v-if="errors.fullName" class="text-xs text-rose-600">{{ errors.fullName }}</span>
      </label>
      <label class="space-y-1 text-sm text-slate-600">
        Email
        <input
          v-model="form.email"
          type="email"
          name="email"
          autocomplete="email"
          class="w-full rounded-xl border border-slate-200 px-4 py-3 text-base text-slate-800 transition focus:border-violet-500 focus:outline-none"
        />
        <span v-if="errors.email" class="text-xs text-rose-600">{{ errors.email }}</span>
      </label>
      <label class="space-y-1 text-sm text-slate-600">
        Phone
        <input
          v-model="form.phone"
          type="tel"
          name="phone"
          autocomplete="tel"
          class="w-full rounded-xl border border-slate-200 px-4 py-3 text-base text-slate-800 transition focus:border-violet-500 focus:outline-none"
        />
        <span v-if="errors.phone" class="text-xs text-rose-600">{{ errors.phone }}</span>
      </label>
      <label class="space-y-1 text-sm text-slate-600">
        Topic
        <select
          v-model="form.topic"
          name="topic"
          class="w-full rounded-xl border border-slate-200 px-4 py-3 text-base text-slate-800 transition focus:border-violet-500 focus:outline-none"
        >
          <option disabled value="">Select a topic</option>
          <option>Order support</option>
          <option>Corporate inquiry</option>
          <option>Product feedback</option>
          <option>Partnership</option>
        </select>
        <span v-if="errors.topic" class="text-xs text-rose-600">{{ errors.topic }}</span>
      </label>
    </div>
    <label class="space-y-1 text-sm text-slate-600">
      Message
      <textarea
        v-model="form.message"
        name="message"
        rows="5"
        class="w-full rounded-2xl border border-slate-200 px-4 py-3 text-base text-slate-800 transition focus:border-violet-500 focus:outline-none"
      ></textarea>
      <span v-if="errors.message" class="text-xs text-rose-600">{{ errors.message }}</span>
    </label>
    <div class="flex flex-col gap-4 lg:flex-row lg:items-center">
      <button
        type="submit"
        class="inline-flex items-center justify-center rounded-full bg-violet-600 px-8 py-3 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-70"
        :disabled="status === 'submitting'"
      >
        <span v-if="status === 'submitting'">Sending...</span>
        <span v-else>Send Message</span>
      </button>
      <p
        class="text-sm"
        :class="status === 'success' ? 'text-emerald-600' : status === 'error' ? 'text-rose-600' : 'text-slate-500'"
        role="status"
        aria-live="polite"
      >
        {{ statusMessage }}
      </p>
    </div>
  </form>
</template>

<script setup lang="ts">
import { reactive, ref } from "vue";

type Status = "idle" | "submitting" | "success" | "error";

const form = reactive({
  fullName: "",
  email: "",
  phone: "",
  topic: "",
  message: "",
});

const errors = reactive<Record<keyof typeof form, string>>({
  fullName: "",
  email: "",
  phone: "",
  topic: "",
  message: "",
});

const status = ref<Status>("idle");
const statusMessage = ref("We'll reply within one business day.");

const validate = () => {
  let isValid = true;
  Object.keys(errors).forEach((key) => {
    errors[key as keyof typeof form] = "";
  });

  if (!form.fullName.trim()) {
    errors.fullName = "Please enter your full name";
    isValid = false;
  }
  if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = "Add a valid email address";
    isValid = false;
  }
  if (!form.phone.trim()) {
    errors.phone = "Phone number helps us follow up faster";
    isValid = false;
  }
  if (!form.topic) {
    errors.topic = "Select a topic";
    isValid = false;
  }
  if (form.message.trim().length < 20) {
    errors.message = "Message should be at least 20 characters";
    isValid = false;
  }
  return isValid;
};

const resetForm = () => {
  form.fullName = "";
  form.email = "";
  form.phone = "";
  form.topic = "";
  form.message = "";
};

const handleSubmit = async () => {
  if (!validate()) {
    status.value = "error";
    statusMessage.value = "Please fix the highlighted fields.";
    return;
  }
  status.value = "submitting";
  statusMessage.value = "Sending your message...";
  await new Promise((resolve) => setTimeout(resolve, 800));
  status.value = "success";
  statusMessage.value = "Thanks! Our concierge will reach out shortly.";
  resetForm();
};
</script>
