type key = number | string;
declare const _default: {
    init: () => void;
    get: (key?: key | undefined, defaultValue?: any) => any;
    set: (key: key, value?: any) => void;
    clear: (key?: key | undefined) => void;
};
export default _default;
