import { Module, ValidationPipe } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { APP_GUARD, APP_PIPE } from '@nestjs/core';
import { AuthGuard } from './auth/auth.guard';

@Module({
  imports: [
    UserModule,
    MongooseModule.forRoot(
      'mongodb+srv://minhha2411:anhcuong8262211@cluster0.x7pef.mongodb.net/practice?retryWrites=true&w=majority&appName=Cluster0',
      {
        connectionFactory: (connection) => {
          if (connection.readyState === 1) {
            console.log('MongoDB connected successfully!');
            console.log('Database name:', connection.db.databaseName);
          }
          connection.on('error', (error) => {
            console.log('MongoDB connection error:', error);
          });
          return connection;
        },
        serverSelectionTimeoutMS: 30000,
      },
    ),
    AuthModule,
  ],

  providers: [
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}
