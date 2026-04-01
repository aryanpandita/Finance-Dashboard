class ApiResponse {
  constructor(statusCode, message, data = null) {
    this.statusCode = statusCode;
    this.message = message;
    this.success = true;
    if (data !== null) this.data = data;
  }
}

export default ApiResponse;