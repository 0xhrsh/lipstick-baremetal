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
import * as tf from '@tensorflow/tfjs-core';
import * as params from './params';
import * as CONST from './const';
import * as EXTENSION from './extension'

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
    const [runtime, $backend] = backend.split('-');

    if (runtime === 'tfjs') {
        await resetBackend($backend);
    }
}

function darkenRGBPercentage(rgb, percentage) {
    const [r, g, b] = rgb;
    return [r * (1 - percentage), g * (1 - percentage), b * (1 - percentage)];
}

/**
 * Draw the keypoints on the video.
 * @param ctx 2D rendering context.
 * @param faces A list of faces to render.
 * @param triangulateMesh Whether or not to display the triangle mesh.
 * @param boundingBox Whether or not to display the bounding box.
 */
export function drawResults(ctx, faces) {
    var rgb = CONST.LIPSTICK_COLORS[params.STATE.color];
    const [r, g, b] = darkenRGBPercentage(rgb, 0)
    drawLipstick(ctx, faces, `rgba(${r}, ${g}, ${b}, ${CONST.LIPSTICK_ALPHA})`);
}

const upperLipPath = [61, 185, 40, 39, 37, 0, 267, 269, 270, 409, 291, 306, 292, 308, 415, 310, 311, 312, 13, 82, 81, 80, 191, 78, 62, 76, 61];
const lowerLipPath = [61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291, 306, 292, 308, 324, 318, 402, 317, 14, 87, 178, 88, 95, 78, 62, 76, 61];

var oldKeyPoints = [];

function calculateLipOffset(keypoints, lipPath) {
    var offset = 0.0;
    for (let i = 0; i < lipPath.length; i++) {
        var index = lipPath[i];
        var dx = keypoints[index][0] - oldKeyPoints[index][0];
        var dy = keypoints[index][1] - oldKeyPoints[index][1];
        offset += Math.sqrt(dx * dx + dy * dy);
    }
    offset /= lipPath.length;
    return offset;
}

function drawFilledLip(ctx, points, lipPath) {
    ctx.beginPath();
    var index = lipPath[0];
    var eIndex;

    ctx.moveTo(points[index][0], points[index][1]);

    for (let i = 0; i < lipPath.length; i++) {
        index = lipPath[i];
        if (EXTENSION.extendedPoints[index.toString()] === undefined) {
            eIndex = index;
        } else {
            eIndex = EXTENSION.extendedPoints[index.toString()];
        }

        var pa = points[index];
        var pb = points[eIndex];

        ctx.lineTo(pa[0] * (1 - CONST.EXTENSION_DELTA) + pb[0] * CONST.EXTENSION_DELTA, pa[1] * (1 - CONST.EXTENSION_DELTA) + pb[1] * CONST.EXTENSION_DELTA);
    }
    ctx.filter = `blur(${CONST.BLUR}px)`;
    ctx.fill();
}

export function drawLipstick(ctx, faces, colour) {
    if (CONST.MAX_FACES > 1) {
        alert("Please set MAX_FACES to 1");
    }

    for (let fi = 0; fi < faces.length; fi++) {
        const face = faces[fi];

        ctx.fillStyle = colour;

        const keypoints = face.keypoints.map((keypoint) => [keypoint.x, keypoint.y]);
        var upperLipOffset = 100;
        var lowerLipOffset = 100;
        if (oldKeyPoints.length > 0) {
            upperLipOffset = calculateLipOffset(keypoints, upperLipPath);
            lowerLipOffset = calculateLipOffset(keypoints, lowerLipPath);
        }
        var offset = (upperLipOffset + lowerLipOffset) / 2;

        if (offset > CONST.MAX_ALLOWED_OFFSET) {
            drawFilledLip(ctx, keypoints, upperLipPath);
            drawFilledLip(ctx, keypoints, lowerLipPath);
            oldKeyPoints = keypoints;
        } else {
            drawFilledLip(ctx, oldKeyPoints, upperLipPath);
            drawFilledLip(ctx, oldKeyPoints, lowerLipPath);
        }
        ctx.filter = 'none';
    }
}
