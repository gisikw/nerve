<script lang="ts">
  import { getToasts, dismissToast } from "./lib/stores/toasts.svelte";

  let toasts = $derived(getToasts());
</script>

<div id="toast-container">
  {#each toasts as toast (toast.id)}
    <div class="toast" class:error={toast.type === "error"} class:info={toast.type === "info"}>
      <span class="toast-message">{toast.message}</span>
      <button
        class="toast-dismiss"
        onclick={() => dismissToast(toast.id)}
        title="Dismiss"
      >&times;</button>
    </div>
  {/each}
</div>

<style>
  #toast-container {
    position: fixed;
    bottom: 24px;
    right: 24px;
    z-index: 1000;
    display: flex;
    flex-direction: column;
    gap: 8px;
    pointer-events: none;
  }

  .toast {
    pointer-events: auto;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    background: var(--bg-surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    font-size: 0.75rem;
    max-width: 400px;
    animation: slide-in 200ms ease-out;
  }

  .toast.error {
    border-left: 3px solid var(--error);
  }

  .toast.info {
    border-left: 3px solid var(--accent);
  }

  .toast-message {
    flex: 1;
    color: var(--text);
    line-height: 1.4;
  }

  .toast-dismiss {
    background: none;
    border: none;
    color: var(--text-muted);
    font-size: 1.2rem;
    line-height: 1;
    cursor: pointer;
    padding: 0;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: color var(--transition);
  }

  .toast-dismiss:hover {
    color: var(--text);
  }

  @keyframes slide-in {
    from {
      opacity: 0;
      transform: translateX(100%);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
</style>
