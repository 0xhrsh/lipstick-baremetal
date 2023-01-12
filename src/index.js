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

import '@tensorflow/tfjs-backend-webgl';

import * as tfjsWasm from '@tensorflow/tfjs-backend-wasm';

tfjsWasm.setWasmPaths(
    `https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-wasm@${tfjsWasm.version_wasm}/dist/`);

import '@tensorflow-models/face-detection';

import { Camera } from './camera';
import { setupDatGui } from './option_panel';
import { STATE, createDetector } from './shared/params';
import { setBackendAndEnvFlags } from './shared/util';

let detector, camera;
let rafId;

async function checkGuiUpdate() {
    if (STATE.isModelChanged || STATE.isFlagChanged || STATE.isBackendChanged) {
        STATE.isModelChanged = true;

        window.cancelAnimationFrame(rafId);

        if (detector != null) {
            detector.dispose();
        }

        if (STATE.isFlagChanged || STATE.isBackendChanged) {
            await setBackendAndEnvFlags(STATE.flags, STATE.backend);
        }

        try {
            detector = await createDetector(STATE.model);
        } catch (error) {
            detector = null;
            alert(error);
        }

        STATE.isFlagChanged = false;
        STATE.isBackendChanged = false;
        STATE.isModelChanged = false;
    }
}

async function renderResult() {
    if (camera.video.readyState < 2) {
        await new Promise((resolve) => {
            camera.video.onloadeddata = () => {
                resolve(video);
            };
        });
    }

    let faces = null;

    // Detector can be null if initialization failed (for example when loading
    // from a URL that does not exist).
    if (detector != null) {
        // FPS only counts the time it takes to finish estimateFaces.


        // Detectors can throw errors, for example when using custom URLs that
        // contain a model that doesn't provide the expected output.
        try {
            faces =
                await detector.estimateFaces(camera.video, { flipHorizontal: false });
        } catch (error) {
            detector.dispose();
            detector = null;
            alert(error);
        }


    }

    camera.drawCtx();

    // The null check makes sure the UI is not in the middle of changing to a
    // different model. If during model change, the result is from an old model,
    // which shouldn't be rendered.
    if (faces && faces.length > 0 && !STATE.isModelChanged) {
        camera.drawResults(
            faces, STATE.modelConfig.triangulateMesh,
            STATE.modelConfig.boundingBox);
    }
}

async function renderPrediction() {
    await checkGuiUpdate();

    if (!STATE.isModelChanged) {
        await renderResult();
    }

    rafId = requestAnimationFrame(renderPrediction);
};

async function app() {
    await setupDatGui(urlParams);

    camera = await Camera.setupCamera();

    await setBackendAndEnvFlags(STATE.flags, STATE.backend);

    detector = await createDetector();

    renderPrediction();
};

app();
