
export default {
  success: function (message, options) {
    const opts = {
      type: ToastifyOption.TYPE.SUCCESS,
      autoClose: 15000,
      position: ToastifyOption.POSITION.BOTTOM_RIGHT,
    };
    Object.assign(opts, options);
    return useToastify(message, opts);
  },
  error: function (message, ...args) {
    console.error(message, args);
    return useToastify(message, {
      type: ToastifyOption.TYPE.ERROR,
      autoClose: 300000,
      position: ToastifyOption.POSITION.BOTTOM_RIGHT,
    });
  }
};
