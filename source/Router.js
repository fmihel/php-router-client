/* eslint-disable eqeqeq */
/* eslint-disable camelcase */
/* eslint-disable array-callback-return */
/* eslint-disable max-len */
/* eslint-disable no-underscore-dangle */

export default class Router {
    constructor() {
        // eslint-disable-next-line no-underscore-dangle
        this.global = {
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

    send({ to, data = {}, params = {} }) {
        const self = this;
        const update = { ...self.global, ...params };
        const { host, id, ...prms } = update;

        const pack = self.do('before', { data, to });

        return fetch(
            host,
            {
                ...prms,
                body: JSON.stringify({ [id]: pack }),
            },
        )
            .then((response) => response.json())
            .then((recvPack) => {
                const recv = self.do('after', { ...recvPack, to });

                if (!('res' in recv)) {
                    throw new Error('неизвестный ответ');
                }

                if (recv.res == 1) {
                    if (!('data' in recv)) {
                        throw new Error('отсутствует data');
                    }
                    return recv.data;
                }

                if (!('msg' in recv)) {
                    throw new Error('ошибка без описания');
                }
                throw new Error(recv.msg);
            });
    }
}
