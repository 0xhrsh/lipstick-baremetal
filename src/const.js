import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';

export const MAX_FACES = 1;
export const TARGET_FPS = 30;
export const BACKEND = 'mediapipe-gpu';
export const MODEL = faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh;
export const VIDEO_SIZE = { width: 640, height: 480 };
export const MOBILE_VIDEO_SIZE = { width: 360, height: 270 };
export const BLUR = 1;
export const MAX_ALLOWED_OFFSET = 1.5;
