<template>
  <div id="settings_btn">
    <button id="enable_btn" class="btn" @click="toggleDrawingEnabled">
      {{ drawingEnabled ? "Выключить" : "Добавить" }}
    </button>
    <button id="reset_btn" @click="resetAnnotations">Сбросить</button>
  </div>
  <button id="add_photo_btn" @click="addPhoto">Добавить фото</button>
  <button id="save_btn" @click="logAnnotations">Сохранить</button>
</template>

<script>
export default {
  props: {
    drawingEnabled: {
      type: Boolean,
      default: true,
    },
  },

  methods: {
    logAnnotations(event) {
      event.preventDefault();
      event.stopPropagation();
      this.$emit("logAnnotations");
      this.$emit("annotationSelected", this.selectedAnnotation);
    },

    resetAnnotations(event) {
      event.preventDefault();
      event.stopPropagation();

      this.$emit("resetAnnotations");
    },

    addPhoto(event) {
      event.preventDefault();
      event.stopPropagation();
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.onchange = (event) => {
        const file = event.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (e) => {
            this.$emit("loadImage", e.target.result);
          };
          reader.readAsDataURL(file);
        }
      };
      input.click();
    },

    toggleDrawingEnabled(event) {
      event.preventDefault();
      event.stopPropagation();
      this.$emit("toggleDrawingEnabled");
    },
  },
};
</script>

<style>
#save_btn {
  background-color: #3c8dbc;
  padding: 5px 10px;
  border-radius: 3px;
  border: 1px solid transparent;
  color: #fff;
  margin-left: 51rem;
  margin-top: 1rem;
}

#enable_btn {
  background-color: #5cb85c;
  padding: 5px 10px;
  font-size: 12px;
  line-height: 1.5;
  border-radius: 3px;
  box-shadow: none;
  border: 1px solid transparent;
  color: #fff;
}

#add_photo_btn {
  background-color: #3c8dbc;
  border: 1px solid transparent;
  padding: 10px 10px;
  color: #fff;
  margin-left: 50rem;
}

#reset_btn {
  background-color: #f39c12;
  border-color: #e08e0b;
  margin-left: 1rem;
  border-radius: 3px;
  color: #ffffff;
  padding: 5px 10px;
}
</style>
