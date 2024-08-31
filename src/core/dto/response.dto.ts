import { ApiHideProperty } from '@nestjs/swagger';

export class PaginatedDto<T> {
    currentPage: number;
    totalPage: number;
    currentCount: number;
    totalCount: number;
    @ApiHideProperty()
    list: T[];
    constructor(args: PaginatedDto<T>) {
        const { currentPage, totalPage, currentCount, totalCount, list } = args;
        this.currentPage = currentPage;
        this.totalPage = totalPage;
        this.currentCount = currentCount;
        this.totalCount = totalCount;
        this.list = list;
    }
}

export class BaseResponseDto<T> {
    statusCode: number;
    message: string;
    @ApiHideProperty()
    data: T;
    constructor(
        args: Pick<BaseResponseDto<T>, 'statusCode' | 'message' | 'data'>,
    ) {
        const { statusCode, message, data } = args;
        this.statusCode = statusCode;
        this.message = message;
        this.data = data;
    }
}
