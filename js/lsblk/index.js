"use strict";
/*
 * Copyright 2018 Balena.io
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("mz/child_process");
const fs_1 = require("mz/fs");
const path_1 = require("path");
const json_1 = require("./json");
const pairs_1 = require("./pairs");
const DISK_PATH_DIR = '/dev/disk/by-path/';
let SUPPORTS_JSON = true;
function getDevicePaths() {
    return __awaiter(this, void 0, void 0, function* () {
        const mapping = new Map();
        for (const filename of yield fs_1.readdir(DISK_PATH_DIR)) {
            const linkPath = path_1.join(DISK_PATH_DIR, filename);
            let link;
            try {
                link = yield fs_1.readlink(linkPath);
            }
            catch (error) {
                continue;
            }
            const devicePath = path_1.resolve(DISK_PATH_DIR, link);
            mapping.set(devicePath, linkPath);
        }
        return mapping;
    });
}
function addDevicePaths(devices) {
    return __awaiter(this, void 0, void 0, function* () {
        const devicePaths = yield getDevicePaths();
        for (const device of devices) {
            device.devicePath = devicePaths.get(device.device) || null;
        }
    });
}
function getOutput(command, ...args) {
    return __awaiter(this, void 0, void 0, function* () {
        const [stdout] = yield child_process_1.execFile(command, args);
        return stdout;
    });
}
function lsblkJSON() {
    return __awaiter(this, void 0, void 0, function* () {
        return json_1.parse(yield getOutput('lsblk', '--bytes', '--all', '--json', '--paths', '--output-all'));
    });
}
function lsblkPairs() {
    return __awaiter(this, void 0, void 0, function* () {
        return pairs_1.parse(yield getOutput('lsblk', '--bytes', '--all', '--pairs'));
    });
}
function $lsblk() {
    return __awaiter(this, void 0, void 0, function* () {
        if (SUPPORTS_JSON) {
            try {
                return yield lsblkJSON();
            }
            catch (error) {
                SUPPORTS_JSON = false;
            }
        }
        return yield lsblkPairs();
    });
}
function lsblk() {
    return __awaiter(this, void 0, void 0, function* () {
        const drives = yield $lsblk();
        try {
            yield addDevicePaths(drives);
        }
        catch (error) {
            // Couldn't add device paths
        }
        return drives;
    });
}
exports.lsblk = lsblk;
//# sourceMappingURL=index.js.map