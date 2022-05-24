import axios from 'axios';

/**
 * Copyright (c) 2018-present, SanQiu, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * Create by mark on 2019/12/11.
 * @emails a9mm51@gmail.com
 */

export default class ACSpeedTestModel {

    async testFastest(hosts) {
        try {
            if (!(hosts instanceof Array)) {
                return undefined;
            }
            if (hosts.length === 0) {
                return undefined;
            }
            console.log('hosts', hosts);
            const requests = hosts.map(host => this._requestV2(host));
            const fastestResult = await Promise.race(requests);
            if (fastestResult) {
                return fastestResult;
            }
            return undefined;
        } catch (error) {
            throw error;
        }
    }

    /**
     * 传入一组hosts即可 测试它们的访问速度返回数据如下
     * [{
     *    host: 'https://www.xxxx.com',
     *    available: false,
     *    message: 'request_time_out'
     * }]
     * @param hosts
     * @returns {Promise<any[]>}
     */
    async testAll(hosts) {
        const requests = hosts.map((host) => this._requestV2(host));
        return await Promise.all(requests);
    }

    _requestV3 = async (host) => {
        try {
            const config = {
                url: `${host}/node/v1/status`,
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                method: 'GET',
                timeout: 3000,
            };
            const startTime = new Date().getTime();
            console.log('config', config);
            const response = await axios.request(config);
            console.log('response', response);
            if (response?.ok) {
                const { server_load: serverLoad, backend_delay: backendDelay } = json;
                const endTime = new Date().getTime();
                const frontEndDelay = endTime - startTime;
                const totalDelay = frontEndDelay + backendDelay;
                if (serverLoad === 'normal') {
                    return { host, available: true, message: 'this_host_is_ok', delay: totalDelay };
                } else {
                    return { host, available: false, message: 'this_host_is_forbidden', delay: totalDelay };
                }
            }
            ;
            return { host, available: false, message: 'response ok = false!' };
        } catch (error) {
            console.log('error', error);
            throw { host, available: false, message: error.message };
        }
    };

    _requestV2 = async (host) => {
        try {
            const url = `${host}/node/v1/status`;
            const startTime = new Date().getTime();
            const response = await fetch(url);
            console.log('response', response);
            if (response?.ok) {
                const { server_load: serverLoad, backend_delay: backendDelay } = json;
                const endTime = new Date().getTime();
                const frontEndDelay = endTime - startTime;
                const totalDelay = frontEndDelay + backendDelay;
                if (serverLoad === 'normal') {
                    return { host, available: true, message: 'this_host_is_ok', delay: totalDelay };
                } else {
                    return { host, available: false, message: 'this_host_is_forbidden', delay: totalDelay };
                }
            }

            return { host, available: false, message: 'response ok = false!' };
        } catch (error) {
            console.log('error', error);
            throw { host, available: false, message: error.message };
        }
    };

    _request = (host) => {
        return new Promise((resolve, reject) => {
            const url = `${host}/node/v1/status`;
            console.log('request fast url', url);
            const http = new XMLHttpRequest();
            http.open('GET', url);
            console.log('OPENED', http.status);
            const startTime = new Date().getTime();
            http.send();
            http.ontimeout = function () {
                console.log('ON_TIME_OUT', http.status);
                resolve({ host, available: false, message: 'request_time_out' });
            };
            http.onerror = function () {
                console.log('ON_ERROR', http.status);
                resolve({ host, available: false, message: 'connect_error' });
            };
            http.onprogress = function () {
                console.log('LOADING', http.status);
            };
            http.onload = function () {
                console.log(`ON_LOAD`, http.status);
                if (200 <= this.status && this.status < 300) {
                    const endTime = new Date().getTime();
                    const frontEndDelay = endTime - startTime;
                    const result = JSON.parse(this.response);
                    const { server_load, backend_delay: backEndDelay } = result;
                    // 前端访问代理机器的delay + 代理机到服务器的delay就是用户到服务器的延迟
                    const totalDelay = frontEndDelay + backEndDelay;
                    console.log(`server_load: ${server_load} totalDelay: ${totalDelay}`);

                } else if (300 <= this.status && this.status < 400) {
                    resolve({ host, available: false, message: 'request_error' });
                } else if (400 <= this.status && this.status < 500) {
                    resolve({
                        host,
                        available: false,
                        message: `ACSpeedTestModel request client error - ${this.status}`,
                    });
                } else if (500 <= this.status) {
                    resolve({ host, available: false, message: 'server_down' });
                } else {
                    resolve({ host, available: false, message: 'ac.speed.test.model.unknown.error' });
                }
            };
        });
    };

}
