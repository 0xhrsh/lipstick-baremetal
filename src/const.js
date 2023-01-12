import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';

export const MAX_FACES = 1;
export const TARGET_FPS = 30;
export const BACKEND = 'mediapipe-gpu';
export const MODEL = faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh;
export const VIDEO_SIZE = '640 X 480';
