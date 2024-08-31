import { BaseResponseDto, PaginatedDto } from '@core/dto/response.dto';
import { applyDecorators, HttpStatus, Type } from '@nestjs/common';
import {
    ApiExtraModels,
    getSchemaPath,
    ApiResponse as SwaggerApiResponse,
} from '@nestjs/swagger';

export const ApiResponse = <GenericType extends Type<unknown>>(args: {
    status: HttpStatus;
    type?: GenericType;
    isArray?: boolean;
}) =>
    applyDecorators(
        args.type
            ? ApiExtraModels(BaseResponseDto, args.type)
            : ApiExtraModels(BaseResponseDto),
        SwaggerApiResponse({
            status: args.status,
            schema: {
                allOf: [
                    {
                        properties: {
                            statusCode: {
                                type: 'number',
                                example: args.status,
                            },
                            message: {
                                type: 'string',
                                example: 'Ok',
                            },
                        },
                    },
                    args.type && {
                        properties: {
                            data: args.isArray
                                ? {
                                      type: 'array',
                                      items: {
                                          $ref: getSchemaPath(args.type),
                                      },
                                  }
                                : {
                                      $ref: getSchemaPath(args.type),
                                  },
                        },
                    },
                ],
            },
        }),
    );

export const ApiPaginatedResponse = <GenericType extends Type<unknown>>(args: {
    status: HttpStatus;
    type: GenericType;
}) =>
    applyDecorators(
        ApiExtraModels(PaginatedDto, args.type),
        SwaggerApiResponse({
            status: args.status,
            schema: {
                allOf: [
                    {
                        properties: {
                            statusCode: {
                                type: 'number',
                                example: args.status,
                            },
                            message: {
                                type: 'string',
                                example: 'Ok',
                            },
                            data: {
                                allOf: [
                                    {
                                        $ref: getSchemaPath(PaginatedDto),
                                    },
                                    {
                                        properties: {
                                            list: {
                                                type: 'array',
                                                items: {
                                                    $ref: getSchemaPath(
                                                        args.type,
                                                    ),
                                                },
                                            },
                                        },
                                    },
                                ],
                            },
                        },
                    },
                ],
            },
        }),
    );

export const ApiBadRequestResponse = () =>
    applyDecorators(
        SwaggerApiResponse({
            status: HttpStatus.BAD_REQUEST,
            schema: {
                properties: {
                    statusCode: {
                        type: 'number',
                        example: 400,
                    },
                    message: {
                        type: 'string',
                        example: 'Bad request',
                    },
                },
            },
        }),
    );

export const ApiNotFoundResponse = () =>
    applyDecorators(
        SwaggerApiResponse({
            status: HttpStatus.NOT_FOUND,
            schema: {
                properties: {
                    statusCode: {
                        type: 'number',
                        example: 400,
                    },
                    message: {
                        type: 'string',
                        example: 'Not found',
                    },
                },
            },
        }),
    );

export const ApiInternalServerErrorResponse = () =>
    applyDecorators(
        SwaggerApiResponse({
            status: HttpStatus.INTERNAL_SERVER_ERROR,
            schema: {
                properties: {
                    statusCode: {
                        type: 'number',
                        example: 500,
                    },
                    message: {
                        type: 'string',
                        example: 'Internal server error',
                    },
                },
            },
        }),
    );
