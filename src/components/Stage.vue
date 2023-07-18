<template>
  <div :class="containerClass">
    <v-stage ref="stage" :config="stageConfig">
      <v-layer ref="layer">
        <v-image :config="imageConfig"></v-image>
        <v-line
          v-for="(annotation, index) in annotations"
          :key="index"
          :config="annotation.arrowConfig"
          @mouseover.native="onLineMouseover(index)"
          @mouseout.native="onLineMouseout"
        ></v-line>

        <v-circle
          v-for="(annotation, index) in annotations"
          :key="`start-${index}`"
          :config="annotation.startCircleConfig"
          @mouseover="
            changeCircleColor(annotation.id, 'startCircleConfig', 'green')
          "
          @mouseout="
            changeCircleColor(annotation.id, 'startCircleConfig', 'red')
          "
          @mousedown="startMovingStart(annotation)"
          @mouseup="stopMovingStart"
        ></v-circle>

        <v-circle
          v-for="(annotation, index) in annotations"
          :key="`end-${index}`"
          :config="annotation.endCircleConfig"
          @mouseover="
            changeCircleColor(annotation.id, 'endCircleConfig', 'green')
          "
          @mouseout="changeCircleColor(annotation.id, 'endCircleConfig', 'red')"
          @mousedown="startMovingEnd(annotation)"
          @mouseup="stopMovingEnd"
        ></v-circle>
        <v-text
          v-for="(annotation, index) in annotations"
          :key="`text-${index}`"
          :config="{
            x: annotation.endCircleConfig.x - 30,
            y: annotation.endCircleConfig.y - 25,
            text: annotation.textConfig.text,
            fontSize: 18,
            draggable: false,
          }"
        ></v-text>
      </v-layer>
    </v-stage>
  </div>
</template>

<script>
export default {
  props: {
    selectedFileUrl: String,
    annotations: {
      type: Array,
      default: () => [],
    },
    drawingEnabled: {
      type: Boolean,
      default: true,
    },
    photo: {
      type: Object,
      default: null,
    },
    editingAnnotation: {
      type: Object,
      default: null,
    },
    imageConfig: {
      type: Object,
      default: null,
    },
  },

  data() {
    return {
      stageConfig: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
      movingEnd: null,
      movingStart: null,
      startPoint: null,
    };
  },

  computed: {
    containerClass() {
      return {
        "crosshair-cursor": this.drawingEnabled,
      };
    },
  },

  mounted() {
    this.$refs.stage.$el.addEventListener("mousedown", this.startDrawing);
    this.$refs.stage.$el.addEventListener("mousemove", this.draw);
    this.$refs.stage.$el.addEventListener("mouseup", this.stopDrawing);
  },

  methods: {
    startMovingStart(annotation) {
      this.movingStart = annotation;
      this.changeCircleColor(annotation.id, "startCircleConfig", "green");
    },

    stopMovingStart(annotation) {
      this.movingStart = null;
      this.changeCircleColor(annotation.id, "startCircleConfig", "red");
    },

    changeCircleColor(id, prop, color) {
      this.$emit("changeCircleColor", { id, prop, color });
    },

    startMovingEnd(annotation) {
      this.movingEnd = annotation;
    },

    stopMovingEnd() {
      this.movingEnd = null;
    },

    onLineMouseover(index) {
      this.$emit("onLineMouseover", index);
    },

    onLineMouseout() {
      this.$emit("onLineMouseout");
    },

    startDrawing(event) {
      if (this.editingAnnotation) return;
      if (!this.drawingEnabled) return;
      if (this.movingEnd) return;
      if (this.editingAnnotation || this.movingEnd || this.movingStart) return;
      const stage = this.$refs.stage.getStage();
      const pos = stage.getPointerPosition();
      this.startPoint = { x: pos.x, y: pos.y };

      const circleConfig = {
        x: this.startPoint.x,
        y: this.startPoint.y,
        radius: 5,
        fill: "darkblue",
        stroke: "darkblue",
        strokeWidth: 1,
      };

      const arrowConfig = {
        points: [
          this.startPoint.x,
          this.startPoint.y,
          this.startPoint.x,
          this.startPoint.y,
        ],
        stroke: "darkblue",
        strokeWidth: 3,
        pointerLength: 10,
        pointerWidth: 10,
        tension: 0,
        draggable: false,
      };

      const textConfig = {
        x: 10,
        y: 10 + 30 * this.annotations.length,
        text: "Примечание",
        fontSize: 18,
        draggable: false,
        editing: false,
      };

      const annotation = {
        id: Date.now(),
        arrowConfig,
        textConfig,
        startCircleConfig: circleConfig,
        endCircleConfig: { ...circleConfig, radius: 10 },
      };

      this.$emit("startDrawing", annotation);
    },

    draw(event) {
      const stage = this.$refs.stage.getStage();
      const pos = stage.getPointerPosition();

      if (!this.drawingEnabled) return;
      if (this.movingEnd) {
        this.movingEnd.endCircleConfig.x = pos.x;
        this.movingEnd.endCircleConfig.y = pos.y;
        this.movingEnd.arrowConfig.points[2] = pos.x;
        this.movingEnd.arrowConfig.points[3] = pos.y;
      } else if (this.movingStart) {
        this.movingStart.startCircleConfig.x = pos.x;
        this.movingStart.startCircleConfig.y = pos.y;
        this.movingStart.arrowConfig.points[0] = pos.x;
        this.movingStart.arrowConfig.points[1] = pos.y;
      } else if (this.startPoint) {
        const currentAnnotation = {
          ...this.annotations[this.annotations.length - 1],
        };
        currentAnnotation.arrowConfig.points = [
          this.startPoint.x,
          this.startPoint.y,
          pos.x,
          pos.y,
        ];
        currentAnnotation.endCircleConfig.x = pos.x;
        currentAnnotation.endCircleConfig.y = pos.y;

        this.$emit("draw", currentAnnotation);
      }
    },

    stopDrawing() {
      if (!this.drawingEnabled) return;
      this.startPoint = null;
      this.movingEnd = null;
      this.movingStart = null;
    },
  },
};
</script>

<style>
.annotation th,
.annotation td {
  padding: 8px;
  text-align: left;
}

.annotation th {
  font-weight: bold;
  border-bottom: 1px solid #ddd;
}

.annotation-item {
  display: flex;
  align-items: center;
  padding-bottom: 8px;
}

.annotation-item p:first-child {
  margin-right: 10px;
}

.highlighted {
  background-color: darkgrey;
}

td,
th {
  border: 1px solid #dddddd;
  text-align: left;
  padding: 8px;
}
</style>
