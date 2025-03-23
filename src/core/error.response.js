'use strict';

const StatusCode = {
    FORBIDDEN: 403,
    CONFLICT: 409,
    UNAUTHORIZED: 401,
    NOT_FOUND: 404,
    BAD_REQUEST: 400,
    INTERNAL_SERVER: 500
}

const ReasonStatusCode = {
    FORBIDDEN: 'Bad request error',
    CONFLICT: 'Conflict error',
    UNAUTHORIZED: 'Unauthorized',
    NOT_FOUND: 'Not found',
    BAD_REQUEST: 'Bad request',
    INTERNAL_SERVER: 'Internal Server Error'
}

class ErrorResponse extends Error {
    constructor(message, status) {
        super(message)
        this.status = status
    }
}

class ConflictRequestError extends ErrorResponse {
    constructor(message = ReasonStatusCode.CONFLICT, statusCode = StatusCode.CONFLICT) {
        super(message, statusCode)
    }
}

class BadRequestError extends ErrorResponse {
    constructor(message = ReasonStatusCode.BAD_REQUEST, statusCode = StatusCode.BAD_REQUEST) {
        super(message, statusCode)
    }
}

class AuthFailureError extends ErrorResponse {
    constructor(message = ReasonStatusCode.UNAUTHORIZED, statusCode = StatusCode.UNAUTHORIZED) {
        super(message, statusCode)
    }
}

class NotFoundError extends ErrorResponse {
    constructor(message = ReasonStatusCode.NOT_FOUND, statusCode = StatusCode.NOT_FOUND) {
        super(message, statusCode)
    }
}

class ForbiddenError extends ErrorResponse {
    constructor(message = ReasonStatusCode.FORBIDDEN, statusCode = StatusCode.FORBIDDEN) {
        super(message, statusCode)
    }
}

module.exports = {
    ConflictRequestError,
    BadRequestError,
    AuthFailureError,
    NotFoundError,
    ForbiddenError
}