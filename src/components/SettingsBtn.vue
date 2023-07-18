<template>
  <div>
    <button id="save_btn" @click="toggleDrawingEnabled">
      {{
        drawingEnabled ? "Выключить редактирование" : "Включить редактирование"
      }}
    </button>
    <button id="reset_btn" @click="resetAnnotations">Сбросить</button>
    <button id="save_btn" @click="logAnnotations">Сохранить</button>
    <input id="add_photo_btn" type="file" @change="addPhoto" />
  </div>
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
      this.$emit("logAnnotations");
    },

    resetAnnotations(event) {
      event.preventDefault();
      this.$emit("resetAnnotations");
    },

    addPhoto(event) {
      event.preventDefault();
      const file = event.target.files[0];
      this.$emit("fileSelected", file);
    },

    toggleDrawingEnabled(event) {
      event.preventDefault();
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
  margin-top: 1rem;
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

.input-file {
  position: relative;
  display: inline-block;
}
.input-file span {
  position: relative;
  display: inline-block;
  cursor: pointer;
  outline: none;
  text-decoration: none;
  font-size: 14px;
  vertical-align: middle;
  color: rgb(255 255 255);
  text-align: center;
  border-radius: 4px;
  background-color: #419152;
  line-height: 22px;
  height: 40px;
  padding: 10px 20px;
  box-sizing: border-box;
  border: none;
  margin: 0;
  transition: background-color 0.2s;
}
.input-file input[type="file"] {
  position: absolute;
  z-index: -1;
  opacity: 0;
  display: block;
  width: 0;
  height: 0;
}

/* Focus */
.input-file input[type="file"]:focus + span {
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

/* Hover/active */
.input-file:hover span {
  background-color: #59be6e;
}
.input-file:active span {
  background-color: #2e703a;
}

/* Disabled */
.input-file input[type="file"]:disabled + span {
  background-color: #eee;
}
</style>
