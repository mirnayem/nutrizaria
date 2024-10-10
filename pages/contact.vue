<script setup>
import { useHead } from "@unhead/vue";

useHead({
  title: "Nutriakl- Contact Us",
  meta: [
    {
      name: "description",
      content:
        "Any question or remarks? Just write us a message or simply call",
    },
  ],
});
</script>
<template>
  <div class="contact-us">
    <h1 class="text-center text-3xl font-light">Contact Us</h1>
    <p class="text-center font-light text-lg mt-2">
      Any question or remarks? Just write us a message or simply call
    </p>
    <div class="contact-body grid grid-cols-12 mt-10 min-h-screen">
      <div
        class="contact-option md:col-span-5 col-span-12 bg-orange-400 rounded-l-lg min-h-[800px] text-white p-20 relative"
      >
        <h1 class="text-3xl font-light">Contact Information</h1>
        <p class="text-lg mt-3 font-light">
          Have you any query about us? Please let us know.
        </p>
        <address class="phone-email-map my-20 grid gap-10">
          <div class="phone flex text-xl items-center gap-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="size-6"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z"
              />
            </svg>

            <a href="tel:+8801820999820"
              ><span class="mr-2">+880</span>1820999820</a
            >
          </div>
          <div class="mail flex text-xl items-center gap-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="size-6"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
              />
            </svg>

            <a
              href="mailto:nutriakl@example.com?subject=Inquiry&body=I%20would%20like%20to%20inquire%20about..."
              >nutriakl@example.com
            </a>
          </div>
          <div class="location flex text-lg items-center gap-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="size-10"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
              />
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
              />
            </svg>

            <p class="">
              Shop 16, Level 3, South Court, Jamuna Future Park, Dhaka
            </p>
          </div>
        </address>

        <div
          class="contact-circle h-40 w-40 rounded-full bg-purple-200 z-10 absolute right-28 bottom-28"
        ></div>
        <div
          class="contact-circle h-72 w-72 rounded-tl-full bg-orange-300 z-5 absolute right-0 bottom-0"
        ></div>

        <SocialIcons class="absolute bottom-10" direction="flex" />
      </div>
      <div
        class="contact-message md:col-span-7 col-span-12 shadow p-5 rounded-md"
      >
        <p class="text-center text-2xl font-r-medium">Get In Touch</p>
        <ContactForm />
        <OurLocation />
      </div>
    </div>
  </div>
</template>

<style></style>
