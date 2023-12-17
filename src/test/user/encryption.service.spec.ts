import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import * as crypto from 'crypto';
import EncryptService from '../../util/encryption';
import { ENV } from '../../constants';

describe('Encyption Service', () => {
  let configService: ConfigService;
  let encryptService: EncryptService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
        EncryptService,
      ],
    }).compile();

    configService = module.get<ConfigService>(ConfigService);
    encryptService = module.get<EncryptService>(EncryptService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('encrypt()', () => {
    test('should encrypt plain text', async () => {
      const mockPlainText = 'yourPlainText';
      const mockEncryptionKey = 'yourEncryptionKey';
      const mockIv = Buffer.from('mockIv');
      const mockCipherText = Buffer.from('mockCipherText');
      const mockAuthTag = 'mockAuthTag';
      jest.spyOn(configService, 'get').mockReturnValueOnce(mockEncryptionKey);
      jest.spyOn(crypto, 'randomBytes').mockReturnValue(mockIv as any);
      jest.spyOn(crypto, 'createCipheriv' as any).mockReturnValue({
        update: jest.fn().mockReturnValue(mockCipherText),
        final: jest.fn().mockReturnValue(Buffer.of()),
        getAuthTag: jest.fn().mockReturnValue({
          toString: jest.fn().mockReturnValue(mockAuthTag),
        }),
      }) as unknown as crypto.CipherGCM;

      const result = await encryptService.encrypt(mockPlainText);
      const expectedEncryptedString = `${mockIv.toString(
        'hex',
      )}_${mockCipherText.toString('hex')}_${mockAuthTag}`;
      expect(result).toEqual(expectedEncryptedString);
      expect(configService.get).toHaveBeenCalledWith(ENV.ENCRYPTION_KEY);
      expect(crypto.randomBytes).toHaveBeenCalledWith(16);
      expect(crypto.createCipheriv).toHaveBeenCalledWith(
        'AES-256-GCM',
        Buffer.from(mockEncryptionKey),
        mockIv,
      );
    });
  });
  describe('decrypt()', () => {
    test(' should decrypt encrypted text', async () => {
      const mockCipherText = 'mockIv_mockEncryptedText_mockAuthTag';
      const mockIv = Buffer.from('mockIv', 'hex');
      const mockEncryptionKey = 'yourEncryptionKey';
      const mockDecryptedText = 'mockDecryptedText';
      jest.spyOn(configService, 'get').mockReturnValueOnce(mockEncryptionKey);

      jest.spyOn(crypto, 'createDecipheriv' as any).mockReturnValue({
        update: jest.fn().mockReturnValue(Buffer.from(mockDecryptedText)),
        final: jest.fn().mockReturnValue(Buffer.of()),
        setAuthTag: jest.fn(),
      });
      const result = await encryptService.decrypt(mockCipherText);

      expect(result).toEqual(mockDecryptedText);

      expect(configService.get).toHaveBeenCalledWith(ENV.ENCRYPTION_KEY);
      expect(crypto.createDecipheriv).toHaveBeenCalledWith(
        'AES-256-GCM',
        Buffer.from(mockEncryptionKey),
        mockIv,
      );
    });
  });
});
