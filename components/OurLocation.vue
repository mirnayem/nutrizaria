<template>
  <div>
    <h2 class="text-2xl font-light mb-4">Visit Us</h2>
    <div id="map" class="w-full h-[400px]"></div>
  </div>
</template>

<script setup>
import { onMounted } from "vue";
import { ref } from "vue";
import "leaflet/dist/leaflet.css"; // Import Leaflet CSS

const mapInitialized = ref(false);

onMounted(async () => {
  if (typeof window !== "undefined") {
    const L = await import("leaflet"); // Require Leaflet only in the client-side

    // Initialize the map
    const map = L.map("map").setView([23.813735, 90.4223979], 17); // Example coordinates (San Francisco)

    // Add tile layer
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 17,
      attribution: "&copy; Nutriakl",
    }).addTo(map);

    // Add a marker
    L.marker([23.813735, 90.4223979])
      .addTo(map)
      .bindPopup("Nutri'akl")
      .openPopup();

    mapInitialized.value = true;
  }
});
</script>

<style scoped>
#map {
  height: 400px; /* Ensure the height is set */
}
</style>
