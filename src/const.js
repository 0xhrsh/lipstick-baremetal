import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';

export const MAX_FACES = 1;

export const BACKEND = 'mediapipe-gpu';
export const MODEL = faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh;

export const VIDEO_SIZE = { width: 1920, height: 1080 };
export const MOBILE_VIDEO_SIZE = { width: 360, height: 270 };
export const TARGET_FPS = 20;

export const MAX_ALLOWED_OFFSET = 1.7;
export const BLUR = 1;

export const LIPSTICK_COLORS = {
    'Sinful Cherry': [170, 0, 52],
    'Delicious Plum': [127, 2, 75]
}
