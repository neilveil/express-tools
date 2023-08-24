declare const env: {
    (key: string, defaultValue?: any): any;
    refresh: () => void;
};
export default env;
