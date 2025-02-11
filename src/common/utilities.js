class HttpResponseAndErrorHandling {
    message;
    data;
    error;

    constructor(message, data, error) {
        this.message = message;
        this.data = data; 
        this.error = error;
    }
    getSuccessResponse() {
        return {
            timestamp: new Date().toISOString(),
            message: this.message,
            data : this.data
        };
    }
    getErrorResponse() {
        return {
            timestamp: new Date().toISOString(),
            message: this.message,
            error: this.error
        };
    }
}

class BadRequest extends Error {
    constructor(message) {
      super(message);
      this.name = 'BadRequest';
    }
  }
  

module.exports = { HttpResponseAndErrorHandling, BadRequest };
