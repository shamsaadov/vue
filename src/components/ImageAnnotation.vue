<template>
  <div style="position: relative">
      <v-stage ref="stage" :config="stageConfig">
          <v-layer ref="layer">
              <v-image :config="imageConfig"></v-image>
              <v-line
                      v-for="(annotation, index) in annotations"
                      :key="index"
                      :config="annotation.arrowConfig"
              ></v-line>
          </v-layer>
      </v-stage>
      <div class="annotation">
          <div v-for="(annotation, index) in annotations" :key="index" >
             <div style="display: flex">
                 <p><strong>{{ index + 1 }})</strong></p>
                 <p v-if="!annotation.editing" @click="startEditText(annotation, $event)">{{ annotation.textConfig.text }}</p>
             </div>
              <input
                      v-if="annotation.editing"
                      type="text"
                      v-model="annotation.textConfig.text"
                      @blur="endEditText(annotation)"
                      @keydown.enter="endEditText(annotation)"
              />
              <button @click="deleteAnnotation(index)">Удалить</button>
              <button @click="toggleEdit(annotation)">{{ annotation.editing ? 'Сохранить' : 'Редактировать' }}</button>
          </div>
      </div>
  </div>
</template>

<script>
import Konva from "konva";
import img from "../assets/vue.png";

export default {
  data() {
    return {
      stageConfig: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
      imageConfig: {
        x: 500,
        y: 0,
        image: null,
      },
      annotations: [],
      startPoint: null,
      editing: false,
      editingText: "",
      editingAnnotation: null,
    };
  },
  mounted() {
    this.loadImage();
    this.$refs.stage.$el.addEventListener("mousedown", this.startDrawing);
    this.$refs.stage.$el.addEventListener("mousemove", this.draw);
    this.$refs.stage.$el.addEventListener("mouseup", this.stopDrawing);
  },
  methods: {
    loadImage() {
      const imageObj = new Image();
      imageObj.src = img;
      imageObj.onload = () => {
        this.imageConfig.image = imageObj;
        this.$nextTick(() => {
          this.$refs.layer.getNode().batchDraw();
        });
      };
    },
      startDrawing(event) {
          if (this.editingAnnotation) return;
          this.drawing = true;
          const stage = this.$refs.stage.getStage();
          const pos = stage.getPointerPosition();
          this.startPoint = { x: pos.x, y: pos.y };

          const arrowConfig = {
              points: [
                  this.startPoint.x,
                  this.startPoint.y,
                  this.startPoint.x,
                  this.startPoint.y,
              ],
              stroke: "blue",
              strokeWidth: 3,
              pointerLength: 10,
              pointerWidth: 10,
              tension: 0,
              draggable: false,
          };

          const textConfig = {
              x: 10,
              y: 10 + 30 * this.annotations.length,
              text: "Нажми на меня",
              fontSize: 18,
              draggable: false,
              editing: false,
          };

          this.annotations.push({
              id: Date.now(),
              arrowConfig,
              textConfig,
          });
      },
      deleteAnnotation(index) {
          this.annotations.splice(index, 1);
      },
      draw(event) {
      if (!this.startPoint || this.editing) return;
      const stage = this.$refs.stage.getStage();
      const pos = stage.getPointerPosition();
      const currentAnnotation = this.annotations[this.annotations.length - 1];

      currentAnnotation.arrowConfig.points = [
        this.startPoint.x,
        this.startPoint.y,
        pos.x,
        pos.y,
      ];
    },
    showInput(annotation, event) {
      if (!this.drawing) {
        this.editing = true;
        this.editingText = annotation.textConfig.text;
        this.editingAnnotation = annotation;
        const inputElement = this.$refs.input;
        inputElement.style.left = event.clientX + "px";
        inputElement.style.top = event.clientY + "px";
        inputElement.style.display = "block";
        inputElement.focus();
      }
    },
      removeAnnotation(annotation) {
          const index = this.annotations.findIndex(a => a.id === annotation.id);
          if (index !== -1) {
              this.annotations.splice(index, 1);
          }
      },
    stopDrawing() {
      if (this.editing) return;
      const currentAnnotation = this.annotations[this.annotations.length - 1];
      const points = currentAnnotation.arrowConfig.points;
      const distance = Math.sqrt(
        Math.pow(points[2] - points[0], 2) + Math.pow(points[3] - points[1], 2)
      );

      if (distance < 20) {
        this.annotations.pop();
      }

      this.startPoint = null;
      this.drawing = false;
    },
      toggleEdit(annotation) {
          annotation.editing = !annotation.editing;
          if (!annotation.editing) {
              this.endEditText(annotation);
          }
      },
      startEditText(annotation, event) {
          annotation.editing = true;
          this.editingAnnotation = annotation;
      },
      endEditText(annotation) {
          annotation.editing = false;
          this.editingAnnotation = null;
      },


    logAnnotations() {
      console.log("Annotations:");
      this.annotations.forEach((annotation, index) => {
        console.log(`Annotation ${index + 1}:`);
        console.log(`x: ${annotation.textConfig.x}`);
        console.log(`y: ${annotation.textConfig.y}`);
        console.log(`Text: ${annotation.textConfig.text}`);
      });
    },
    getTextConfig(annotation, index) {
      return {
        ...annotation.textConfig,
        x: 10,
        y: 10 + 30 * index,
      };
    },
  },
};
</script>

<style>
.annotation {
    position: absolute;
    top: 10px;
}
button {
    color: white;
    font-size: 16px;
    padding: 10px 20px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: all 0.3s ease;
}

button:hover {
    opacity: 0.8;
}

button:nth-child(3) {
    background-color: red;
}

button:nth-child(3) {
    background-color: #ff0000;
}


button:nth-child(4) {
    background-color: blue;
}

</style>
