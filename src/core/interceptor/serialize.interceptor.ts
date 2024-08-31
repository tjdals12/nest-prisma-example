import {
    CallHandler,
    ExecutionContext,
    HttpStatus,
    Injectable,
    NestInterceptor,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { Response } from 'express';
import { BaseResponseDto } from '../dto/response.dto';

@Injectable()
export class SerializeInterceptor implements NestInterceptor {
    intercept(
        context: ExecutionContext,
        next: CallHandler<any>,
    ): Observable<any> | Promise<Observable<any>> {
        const ctx = context.switchToHttp();
        const response = ctx.getResponse<Response>();
        const statusCode = response.statusCode;
        let message: string = 'Ok';
        switch (statusCode) {
            case HttpStatus.BAD_REQUEST:
                message = 'Bad request';
                break;
            case HttpStatus.INTERNAL_SERVER_ERROR:
                message = 'Internal server error';
                break;
        }
        return next.handle().pipe(
            map(
                (data) =>
                    new BaseResponseDto({
                        statusCode,
                        message,
                        data,
                    }),
            ),
        );
    }
}
