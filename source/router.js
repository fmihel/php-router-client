/* eslint-disable camelcase */
/* eslint-disable array-callback-return */
/* eslint-disable max-len */
/* eslint-disable no-underscore-dangle */

class Router {
    constructor() {
        // eslint-disable-next-line no-underscore-dangle
        this._params = {
            host: './',
            id: 'router',
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
        } else {
            throw new Error(`event ${event} no exists in router? use before or after`);
        }
        return this;
    }

    do(event, pack) {
        if (event in this.events) {
            let out = pack;
            this.events[event].map((callback) => {
                out = { ...out, ...callback(pack) };
            });
            return out;
        }
        throw new Error(`event ${event} no exists in router? use before or after`);
    }

    async send({ to, data = {}, params = {} }) {
        try {
            const update = { ...this._params, ...params };
            const { host, id, ...prms } = update;

            const sendPack = this.do('before', { data, to });

            const response = await fetch(
                host,
                {
                    ...prms,
                    body: JSON.stringify({ [id]: sendPack }),
                },
            );

            const recvPack = await response.json(); // parses JSON response into native JavaScript objects

            if (!('res' in recvPack)) {
                throw new Error('неизвестный ответ');
            }

            if (recvPack.res == 1) {
                if (!('data' in recvPack)) {
                    throw new Error('отсутствует data');
                }
                this.do('after', recvPack.param);
                return recvPack.data;
            }

            if (!('msg' in recvPack)) {
                throw new Error('ошибка без описания');
            }

            throw new Error(recvPack.msg);
        } catch (e) {
            console.error(e);
            throw e;
        }
    }
}

const router = new Router();
export default router;
