/**
 * @license
 * Copyright 2022 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */
import * as faceMesh from '@mediapipe/face_mesh';
import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';
import * as CONST from '../const';


export const VIDEO_SIZES = {
    '640 X 480': { width: 640, height: 480 },
    '640 X 360': { width: 640, height: 360 },
    '360 X 270': { width: 360, height: 270 }
};
export const STATE = {
    color: ''
};

export const LIPSTICK_COLORS = {
    'Sinful Cherry': [170, 0, 52],
    'Delicious Plum': [127, 2, 75]
}

export async function createDetector() {
    switch (CONST.MODEL) {
        case faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh:
            const runtime = CONST.BACKEND.split('-')[0];
            if (runtime === 'mediapipe') {
                return faceLandmarksDetection.createDetector(CONST.MODEL, {
                    runtime,
                    refineLandmarks: true,
                    maxFaces: CONST.MAX_FACES,
                    solutionPath: `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@${faceMesh.VERSION}`
                });
            } else if (runtime === 'tfjs') {
                return faceLandmarksDetection.createDetector(CONST.MODEL, {
                    runtime,
                    refineLandmarks: true,
                    maxFaces: CONST.MAX_FACES,
                });
            }
    }
}
