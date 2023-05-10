<template>
  <div style="position: relative">
    <v-stage ref="stage" :config="stageConfig">
      <v-layer ref="layer">
        <v-image :config="imageConfig"></v-image>
        <template v-for="(annotation, index) in annotations">
          <v-line :config="annotation.arrowConfig"></v-line>
          <v-text
            :config="getTextConfig(annotation, index)"
            @mousedown="startEditText(annotation, $event)"
          ></v-text>
        </template>
      </v-layer>
    </v-stage>
    <input
      ref="input"
      type="text"
      :style="{ display: editing ? 'block' : 'none', zIndex: 1000 }"
      v-model="editingText"
      @blur="endEditText"
      @keydown.enter="endEditText"
      style="position: absolute"
    />
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
    startDrawing() {
      if (this.editing) return;
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
      };

      this.annotations.push({
        id: Date.now(),
        arrowConfig,
        textConfig,
      });
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

    startEditText(annotation, event) {
      const nativeEvent = event.evt;
      nativeEvent.stopPropagation();
      nativeEvent.preventDefault();

      if (this.drawing) return;

      this.editing = true;
      this.editingText = annotation.textConfig.text;
      this.editingAnnotation = annotation;
      const inputElement = this.$refs.input;
      inputElement.style.left = nativeEvent.clientX + "px";
      inputElement.style.top = nativeEvent.clientY + "px";
      inputElement.style.display = "block";
      inputElement.focus();
    },

    endEditText() {
      this.editing = false;
      if (this.editingAnnotation) {
        this.editingAnnotation.textConfig.text =
          this.editingText.trim().length === 0
            ? "Введите примечание"
            : this.editingText;
        this.editingAnnotation = null;
      }
      this.$refs.input.style.display = "none";
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
