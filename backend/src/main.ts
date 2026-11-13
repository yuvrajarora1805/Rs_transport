import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import * as jwt from 'jsonwebtoken';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  app.enableCors({
    origin: true,
    credentials: true,
  });

  // Seamless Office ERP Auto-Auth Middleware
  const jwtSecret = process.env.JWT_SECRET || 'rs-transport-erp-super-secret-key-2026';
  const defaultAdminToken = jwt.sign(
    { sub: 'default-admin-id', username: 'admin', role: 'SUPER_ADMIN' },
    jwtSecret,
    { expiresIn: '365d' },
  );

  app.use((req: any, res: any, next: any) => {
    const auth = req.headers?.authorization;
    if (!auth || auth === 'Bearer null' || auth === 'Bearer undefined') {
      req.headers.authorization = `Bearer ${defaultAdminToken}`;
    }
    next();
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.useGlobalFilters(new AllExceptionsFilter());

  const port = process.env.PORT || 4000;
  await app.listen(port, '0.0.0.0');
  console.log(`🚛 RS Transport ERP API running on: http://0.0.0.0:${port}`);
}
bootstrap();
