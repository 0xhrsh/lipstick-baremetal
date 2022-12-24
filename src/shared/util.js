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
import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';
import * as tf from '@tensorflow/tfjs-core';
import { count } from 'console';

import { GREEN, BLUE, LABEL_TO_COLOR, NUM_IRIS_KEYPOINTS, NUM_KEYPOINTS, RED, TUNABLE_FLAG_VALUE_RANGE_MAP } from './params';
import { TRIANGULATION } from './triangulation';

export function isiOS() {
    return /iPhone|iPad|iPod/i.test(navigator.userAgent);
}

export function isAndroid() {
    return /Android/i.test(navigator.userAgent);
}

export function isMobile() {
    return isAndroid() || isiOS();
}

/**
 * Reset the target backend.
 *
 * @param backendName The name of the backend to be reset.
 */
async function resetBackend(backendName) {
    const ENGINE = tf.engine();
    if (!(backendName in ENGINE.registryFactory)) {
        throw new Error(`${backendName} backend is not registed.`);
    }

    if (backendName in ENGINE.registry) {
        const backendFactory = tf.findBackendFactory(backendName);
        tf.removeBackend(backendName);
        tf.registerBackend(backendName, backendFactory);
    }

    await tf.setBackend(backendName);
}

/**
 * Set environment flags.
 *
 * This is a wrapper function of `tf.env().setFlags()` to constrain users to
 * only set tunable flags (the keys of `TUNABLE_FLAG_TYPE_MAP`).
 *
 * ```js
 * const flagConfig = {
 *        WEBGL_PACK: false,
 *      };
 * await setEnvFlags(flagConfig);
 *
 * console.log(tf.env().getBool('WEBGL_PACK')); // false
 * console.log(tf.env().getBool('WEBGL_PACK_BINARY_OPERATIONS')); // false
 * ```
 *
 * @param flagConfig An object to store flag-value pairs.
 */
export async function setBackendAndEnvFlags(flagConfig, backend) {
    if (flagConfig == null) {
        return;
    } else if (typeof flagConfig !== 'object') {
        throw new Error(
            `An object is expected, while a(n) ${typeof flagConfig} is found.`);
    }

    // Check the validation of flags and values.
    for (const flag in flagConfig) {
        // TODO: check whether flag can be set as flagConfig[flag].
        if (!(flag in TUNABLE_FLAG_VALUE_RANGE_MAP)) {
            throw new Error(`${flag} is not a tunable or valid environment flag.`);
        }
        if (TUNABLE_FLAG_VALUE_RANGE_MAP[flag].indexOf(flagConfig[flag]) === -1) {
            throw new Error(
                `${flag} value is expected to be in the range [${TUNABLE_FLAG_VALUE_RANGE_MAP[flag]}], while ${flagConfig[flag]}` +
                ' is found.');
        }
    }

    tf.env().setFlags(flagConfig);

    const [runtime, $backend] = backend.split('-');

    if (runtime === 'tfjs') {
        await resetBackend($backend);
    }
}

function distance(a, b) {
    return Math.sqrt(Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2));
}

function drawPath(ctx, points, closePath) {
    const region = new Path2D();
    region.moveTo(points[0][0], points[0][1]);
    for (let i = 1; i < points.length; i++) {
        const point = points[i];
        region.lineTo(point[0], point[1]);
    }

    if (closePath) {
        region.closePath();
    }
    ctx.stroke(region);
}

/**
 * Draw the keypoints on the video.
 * @param ctx 2D rendering context.
 * @param faces A list of faces to render.
 * @param triangulateMesh Whether or not to display the triangle mesh.
 * @param boundingBox Whether or not to display the bounding box.
 */

const upperLipPath = [61, 185, 40, 39, 37, 0, 267, 269, 270, 409, 291, 292, 415, 310, 311, 312, 13, 82, 81, 80, 191, 78, 62, 76, 61];
const lowerLipPath = [61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291, 292, 308, 324, 318, 402, 317, 14, 87, 178, 88, 95, 78, 62, 76, 61];



export function drawResults(ctx, faces, triangulateMesh, boundingBox) {
    for (let fi = 0; fi < faces.length; fi++) {
        const face = faces[fi];

        ctx.fillStyle = "rgba(168, 0, 34, 0.35)";

        const keypoints = face.keypoints.map((keypoint) => [keypoint.x, keypoint.y]);

        ctx.beginPath();
        var index = upperLipPath[0];
        ctx.moveTo(keypoints[index][0], keypoints[index][1]);
        for (let i = 1; i < upperLipPath.length; i++) {
            index = upperLipPath[i];
            ctx.lineTo(keypoints[index][0], keypoints[index][1]);
        }
        ctx.fill();

        ctx.beginPath();
        var index = lowerLipPath[0];
        ctx.moveTo(keypoints[index][0], keypoints[index][1]);
        for (let i = 1; i < lowerLipPath.length; i++) {
            index = lowerLipPath[i];
            ctx.lineTo(keypoints[index][0], keypoints[index][1]);
        }
        ctx.fill();
    }
}
