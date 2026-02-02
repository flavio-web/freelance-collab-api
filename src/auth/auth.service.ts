/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import { FirebaseService } from '../firebase/firebase.service';
import { RegisterDto } from './dto/register.dto/register.dto';
import { FIREBASE_AUTH_ERRORS } from '../firebase/firebase-errors';

@Injectable()
export class AuthService {
  constructor(
    private firebase: FirebaseService,
    private config: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    try {
      // Crear usuario en Firebase Auth
      const user = await this.firebase.getAuth().createUser({
        email: dto.email,
        password: dto.password,
      });

      const dataUser = {
        nombre: dto.nombre,
        apellido: dto.apellido,
        email: dto.email,
        telefono: dto.telefono ?? null,
        titulos: dto.titulos ?? [],
        tecnologias: dto.tecnologias ?? [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      // Crear perfil en Firestore
      await this.firebase.getFirestore().collection('users').doc(user.uid).set(dataUser);

      return {
        data: {
          uid: user.uid,
          ...dataUser,
        },
        message: 'Usuario registrado correctamente',
        status: true,
      };
    } catch (error) {
      const message =
        FIREBASE_AUTH_ERRORS[error.code] ?? 'Ocurrió un error al registrar el usuario';

      /*const message =
        error instanceof Error
          ? error.message
          : 'Se produjo un error desconocido';*/
      throw new BadRequestException(message);
    }
  }

  async login(email: string, password: string) {
    const apiKey = this.config.get<string>('FIREBASE_API_KEY');

    try {
      const firebaseResponse = await axios.post(
        `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
        {
          email,
          password,
          returnSecureToken: true,
        },
      );

      const { localId: uid, idToken, refreshToken, expiresIn } = firebaseResponse.data;

      // 2. Obtener datos del usuario desde Firestore
      const firestore = this.firebase.getFirestore();

      const userSnap = await firestore.collection('users').doc(uid).get();

      if (!userSnap.exists) {
        throw new BadRequestException('Perfil de usuario no encontrado');
      }

      const userData = userSnap.data();

      // 3. Respuesta final
      return {
        status: true,
        message: 'Login exitoso',
        data: {
          token: idToken,
          refreshToken,
          expiresIn,
          user: {
            ...userData,
            uid,
          },
        },
      };
    } catch (error: any) {
      const code = error.response?.data?.error?.message;

      console.log('Firebase error:', error.response?.data?.error);
      throw new BadRequestException({
        status: false,
        message: this.mapFirebaseError(code as string),
        error: 'BadRequestException',
        errors: [],
      });
    }
  }

  async validateToken(token: string) {
    try {
      const decodedToken = await this.firebase.getAuth().verifyIdToken(token);

      return {
        status: true,
        message: 'Token válido',
        data: {
          uid: decodedToken.uid,
          email: decodedToken.email,
        },
      };
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      throw new UnauthorizedException({
        status: false,
        message: 'Token incorrecto o expirado',
      });
    }
  }

  /**
   * 🔄 Renueva el access token usando el refresh token
   */
  async refreshToken(refreshToken: string) {
    try {
      const apiKey = this.config.get<string>('FIREBASE_API_KEY');
      const url = `https://securetoken.googleapis.com/v1/token?key=${apiKey}`;

      const response = await axios.post(url, {
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      });

      const data = response.data;

      return {
        status: true,
        message: 'Token renovado',
        data: {
          token: data.id_token,
          refreshToken: data.refresh_token,
          expiresIn: data.expires_in,
        },
      };
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      throw new UnauthorizedException({
        status: false,
        message: 'Refresh token inválido o expirado',
      });
    }
  }

  private mapFirebaseError(code: string): string {
    const errors: Record<string, string> = {
      EMAIL_NOT_FOUND: 'El correo no está registrado.',
      INVALID_PASSWORD: 'La contraseña es incorrecta.',
      USER_DISABLED: 'El usuario está deshabilitado.',
    };

    return errors[code] ?? 'Credenciales inválidas';
  }
}
