import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { FirebaseService } from 'src/firebase/firebase.service';
import { CreateRequestDto } from './dto/create-request.dto';
import { RequestStatus } from './enum/request-status.enum';

@Injectable()
export class RequestsService {
  private db;

  constructor(private firebaseService: FirebaseService) {
    this.db = this.firebaseService.getFirestore();
  }

  async create(userId: string, dto: CreateRequestDto) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const projectRef = this.db.collection('projects').doc(dto.projectId);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const projectSnap = await projectRef.get();

    if (!projectSnap.exists) {
      throw new BadRequestException('El proyecto no existe');
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const project = projectSnap.data();

    if (project.estado !== 'HABILITADO') {
      throw new BadRequestException('El proyecto no acepta solicitudes');
    }

     // Validar que el owner no se auto-solicite
    if (project.ownerId === userId) {
      throw new BadRequestException(
        'No puedes enviar una solicitud a tu propio proyecto',
      );
    }

    // Evitar solicitudes duplicadas
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const existing = await this.db
      .collection('project_requests')
      .where('userId', '==', userId)
      .where('projectId', '==', dto.projectId)
      .limit(1)
      .get();

    if (!existing.empty) {
      throw new BadRequestException('Ya enviaste una solicitud a este proyecto');
    }

    const now = new Date();

    const requestData = {
      userId,
      projectId: dto.projectId,
      estado: RequestStatus.PENDIENTE,
      createdAt: now,
      updatedAt: now,
    };

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    const docRequest = this.db.collection('project_requests').add(requestData);
    return {
      status: true,
      message: 'Solicitud creada correctamente',
      data: {
        id: docRequest.id,
        ...requestData,
      },
    };
  }

  async accept(ownerId: string, requestId: string) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const requestRef = this.db.collection('project_requests').doc(requestId);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const requestSnap = await requestRef.get();

    if (!requestSnap.exists) {
      throw new BadRequestException('Solicitud no encontrada');
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const request = requestSnap.data();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const projectRef = this.db.collection('projects').doc(request.projectId);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const projectSnap = await projectRef.get();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const project = projectSnap.data();

    //Solo el dueño del proyecto
    if (project.ownerId !== ownerId) {
      throw new ForbiddenException('No puedes aceptar solicitudes de este proyecto');
    }

    //Contar solicitudes aceptadas
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const acceptedCountSnap = await this.db
      .collection('project_requests')
      .where('projectId', '==', request.projectId)
      .where('estado', '==', RequestStatus.ACEPTADO)
      .get();

    if (acceptedCountSnap.size >= project.maxColaboradores) {
      throw new BadRequestException('Se alcanzó el máximo de colaboradores');
    }

    await requestRef.update({
      estado: RequestStatus.ACEPTADO,
      updatedAt: new Date(),
    });

    return { status: true, message: 'Solicitud aceptada' };
  }

  async reject(ownerId: string, requestId: string) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const requestRef = this.db.collection('project_requests').doc(requestId);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const requestSnap = await requestRef.get();

    if (!requestSnap.exists) {
      throw new BadRequestException('Solicitud no encontrada');
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const request = requestSnap.data();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const projectSnap = await this.db.collection('projects').doc(request.projectId).get();

    if (projectSnap.data().ownerId !== ownerId) {
      throw new ForbiddenException();
    }

    await requestRef.update({
      estado: RequestStatus.RECHAZADO,
      updatedAt: new Date(),
    });

    return { status: true, message: 'Solicitud rechazada' };
  }

  // eslint-disable-next-line prettier/prettier
  async getByProject( userId: string, projectId: string, estado?: RequestStatus ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const projectRef = this.db.collection('projects').doc(projectId);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const projectSnap = await projectRef.get();

    if (!projectSnap.exists) {
      throw new BadRequestException('Proyecto no encontrado');
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const project = projectSnap.data();

    //Solo el dueño puede ver solicitudes
    if (project.ownerId !== userId) {
      throw new ForbiddenException('No tienes acceso a este proyecto');
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    let query: FirebaseFirestore.Query = this.db
      .collection('project_requests')
      .where('projectId', '==', projectId);

    if (estado) {
      query = query.where('estado', '==', estado);
    }

    const snapshot = await query.orderBy('createdAt', 'desc').get();

    if (snapshot.empty) {
      return {
        status: false,
        message: estado
          ? `No existen solicitudes con estado ${estado} para el proyecto`
          : 'No existen solicitudes para el proyecto',
        data: [],
      };
    }

    const data = await Promise.all(
      snapshot.docs.map(async (doc) => {
        const data = doc.data();

        // usuario solicitante
        const userSnap = await this.db
          .collection('users')
          .doc(data.userId)
          .get();

        const user = userSnap.exists
          ? { id: userSnap.id, ...userSnap.data() }
          : null;

        return {
          id: doc.id,
          estado: data.estado,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
          user,
          project,
        };
      }),
    );

    return {
      status: true,
      message: 'Solicitudes obtenidas correctamente',
      data,
    };
  }
}
