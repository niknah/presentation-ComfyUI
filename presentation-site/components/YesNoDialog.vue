<template>
  <div v-if="isVisible" class="modal-overlay">
    <div class="modal-content">
      <p>{{ message }}</p>
      <div class="modal-actions">
        <button @click="confirm(true)">Yes</button>
        <button @click="confirm(false)">No</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    message: {
      type: String,
      default: 'Are you sure?',
    },
  },
  data() {
    return {
      isVisible: false,
      resolvePromise: null,
    };
  },
  methods: {
    show() {
      this.isVisible = true;
      return new Promise((resolve) => {
        this.resolvePromise = resolve;
      });
    },
    confirm(choice) {
      this.isVisible = false;
      if (this.resolvePromise) {
        this.resolvePromise(choice);
      }
    },
  },
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}

.modal-content {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.modal-actions button {
  margin: 0 10px;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.modal-actions button:first-child {
  background-color: #4CAF50; /* Green for Yes */
  color: white;
}

.modal-actions button:last-child {
  background-color: #f44336; /* Red for No */
  color: white;
}
</style>
