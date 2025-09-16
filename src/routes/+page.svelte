<script>
  import Hero from '$lib/Hero.svelte';
</script>

<main>
  <Hero />
</main>

<style>
  :global(*) {
    box-sizing: border-box;
  }

  :global(body) {
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    background: #f8fafc;
  }

  main {
    width: 100%;
    min-height: 100vh;
    overflow: hidden;
  }
</style>