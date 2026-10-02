import { Global, Module } from '@nestjs/common';
import { ENV } from '../../config/app.config';
import { S3ObjectStorage } from './s3-storage.service';
import { LocalObjectStorage } from './local-storage.service';
import { ObjectStorage, OBJECT_STORAGE } from './object-storage.interface';

@Global()
@Module({
  providers: [
    {
      provide: OBJECT_STORAGE,
      useFactory: (): ObjectStorage => {
        if (ENV.storageDriver === 's3') {
          const s3 = new S3ObjectStorage();
          if (s3.enabled) return s3;
        }
        return new LocalObjectStorage();
      },
    },
  ],
  exports: [OBJECT_STORAGE],
})
export class StorageModule {}