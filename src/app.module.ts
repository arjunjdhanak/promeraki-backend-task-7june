import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PartsModule } from './parts/parts.module';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [PartsModule, MongooseModule.forRoot('mongodb://localhost/parts-inventory'),],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
