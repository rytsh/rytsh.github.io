<script lang="ts">
  import HomeTerminal from "@/components/HomeTerminal.svelte";
  import Info from "@/components/Info.svelte";
</script>

<div class="min-h-dvh w-full max-w-full overflow-x-hidden flex flex-col gap-2 sm:px-[5%]">
  <div class="mx-[5%] flex flex-wrap py-2 border-b-2 border-black mb-2 sm:mx-0">
    <Info />
  </div>
  <div class="flex min-h-0 w-full min-w-0 flex-1 flex-wrap gap-2 flex-col sm:flex-row">
    <div class="min-h-0 min-w-0 flex-1">
      <HomeTerminal />
    </div>
  </div>
</div>
