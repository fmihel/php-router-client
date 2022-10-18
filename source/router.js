/* eslint-disable max-len */
/* eslint-disable no-underscore-dangle */

class Router {
    constructor() {
        // eslint-disable-next-line no-underscore-dangle
        this._params = {
            host: './',
            method: 'POST', // *GET, POST, PUT, DELETE, etc.
            mode: 'no-cors', // no-cors, *cors, same-origin
            cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
            credentials: 'include', // include, *same-origin, omit
            headers: {
                'Content-Type': 'application/json',
                // 'Content-Type': 'application/x-www-form-urlencoded',
            },
            redirect: 'follow', // manual, *follow, error
            referrerPolicy: 'no-referrer', // no-referrer, *client
            // body: data // body data type must match "Content-Type" header
        };

        // this.host = window.location.href;

        this.events = {
            before: [],
            after: [],
        };
    }

    /**
     * установка/получение параметра
     * @param {any}  o
     *  params(undefined) - return all params
     *  params(obj) set obj to params
     *
     * @return {any}
    */
    // eslint-disable-next-line consistent-return
    params(a = undefined) {
        // eslint-disable-next-line no-underscore-dangle
        if (a === undefined) {
            return this._params;
        }
        this._params = { ...this._params, ...a };
    }

    /** регистрируем события  */
    on(event, callback) {
        if (event in this.events) {
            if (this.events[event].indexOf(callback) === -1) {
                this.events[event].push(callback);
            }
        }
        return this;
    }

    do(event, param) {
        let result = true;
        if (event in this.events) {
            this.events[event].find((callback) => {
                try {
                    const ret = callback(param, event);
                    if ((ret !== undefined) && (ret !== true)) {
                        result = ret;
                        return true;
                    }
                } catch (e) {
                    console.error(e);
                    result = false;
                }
                return true;
            });
        }
        return result;
    }

    async send({ to, data = {}, params = {} }) {
        try {
            const prms = { ...this._params, ...params };

            const response = await fetch(
                prms.host,
                {
                    ...prms,
                    body: JSON.stringify({ data, to }),
                },
            );

            const pack = await response.json(); // parses JSON response into native JavaScript objects

            if (!('res' in pack)) {
                throw new Error('неизвестный ответ');
            }

            if (pack.res == 1) {
                if (!('data' in pack)) {
                    throw new Error('отсутствует data');
                }
                return pack.data;
            }

            if (!('msg' in pack)) {
                throw new Error('ошибка без описания');
            }

            throw new Error(pack.msg);
        } catch (e) {
            console.error(e);
            throw e;
        }
    }
}

const router = new Router();
export default router;
