class CustomError extends Error {
    constructor(message, status) {
      super(message); // Gọi constructor của lớp cha (Error) với message được truyền vào
      this.name = this.constructor.name; // Đặt lại name của đối tượng lỗi
      this.status = status || 500; // Nếu status không được truyền vào, sử dụng giá trị mặc định là 500
    }
  }
  module.exports = CustomError