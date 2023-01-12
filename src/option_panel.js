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
import * as params from './shared/params';

export async function setupDatGui() {
    const gui = new dat.GUI({ width: 300 });
    gui.domElement.id = 'gui';

    const lipstick = gui.addFolder('Lipstick');

    const fixedSelectionCount = 0;
    while (lipstick.__controllers.length > fixedSelectionCount) {
        lipstick.remove(
            lipstick
                .__controllers[lipstick.__controllers.length - 1]);
    }
    const colors = Object.keys(params.LIPSTICK_COLORS);
    params.STATE.color = colors[0];
    const colorController =
        lipstick.add(params.STATE, 'color', colors);
    colorController.name('Color');
    lipstick.open();

    return;
}
