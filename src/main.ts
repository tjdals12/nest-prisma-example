import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SerializeInterceptor } from '@core/interceptor/serialize.interceptor';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    /** Pipes */
    app.useGlobalPipes(
        new ValidationPipe({
            transform: true,
        }),
    );

    /** Interceptors */
    app.useGlobalInterceptors(new SerializeInterceptor());

    /** Swagger */
    const config = new DocumentBuilder()
        .setTitle('API')
        .setDescription('API Description')
        .setVersion('1.0')
        .addBearerAuth({
            type: 'http',
            description: 'Access Token',
        })
        .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api-docs', app, document, {
        swaggerOptions: {
            persistAuthorization: true,
        },
    });

    await app.listen(3000);
}
bootstrap();
