import { ObjectDetector, FilesetResolver } from '@mediapipe/tasks-vision';

let detectorPromise = null;
let detectorInstance = null;

export async function initTvDetector() {
  if (detectorInstance) {
    return detectorInstance;
  }

  if (detectorPromise) {
    return detectorPromise;
  }

  detectorPromise = (async () => {
    try {
      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.2/wasm'
      );

      const detector = await ObjectDetector.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            'https://storage.googleapis.com/mediapipe-models/object_detector/efficientdet_lite2/float16/1/efficientdet_lite2.tflite',
          delegate: 'GPU',
        },
        scoreThreshold: 0.3,
        runningMode: 'VIDEO',
      });

      detectorInstance = detector;
      return detector;
    } catch (err) {
      console.error('Error precargando el Modelo:', err);
      throw err;
    }
  })();

  return detectorPromise;
}

export async function getTvDetector() {
  if (detectorInstance) return detectorInstance;
  return initTvDetector();
}