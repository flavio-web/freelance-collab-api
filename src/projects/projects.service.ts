/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Injectable, NotFoundException } from '@nestjs/common';
import { FirebaseService } from 'src/firebase/firebase.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectsService {
  private collection;

  constructor(private firebase: FirebaseService) {
    this.collection = this.firebase.getFirestore().collection('projects');
  }

  async create(dto: CreateProjectDto, ownerId: string) {
    const now = new Date();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const doc = await this.collection.add({
      ...dto,
      ownerId,
      requerimientos: dto.requerimientos ?? [],
      createdAt: now,
      updatedAt: now,
    });

    return {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      uid: doc.id!,
      ownerId,
      ...dto,
      createdAt: now,
      updatedAt: now,
    };
  }

  async findMe(ownerId: string) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const snapshot = await this.collection.where('ownerId', '==', ownerId).get();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    return snapshot.docs.map((doc) => ({ uid: doc.id, ...doc.data() }));
  }

  async findAllHability() {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const snapshot = await this.collection.where('estado', '==', 'HABILITADO').get();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    return snapshot.docs.map((doc) => ({ uid: doc.id, ...doc.data() }));
  }
  async findAllByCategory(category: string) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const snapshot = await this.collection.where('categoria', '==', category).get();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    return snapshot.docs.map((doc) => ({ uid: doc.id, ...doc.data() }));
  }

  async findOne(id: string, ownerId: string) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const doc = await this.collection.doc(id).get();

    if (!doc.exists || doc.data().ownerId !== ownerId) {
      throw new NotFoundException('Proyecto no encontrado');
    }

    return {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      uid: doc.id,
      ...doc.data(),
    };
  }

  async update(id: string, dto: UpdateProjectDto, ownerId: string) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const ref = this.collection.doc(id);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const doc = await ref.get();

    if (!doc.exists || doc.data().ownerId !== ownerId) {
      throw new NotFoundException('Proyecto no encontrado');
    }

    await ref.update({
      ...dto,
      updatedAt: new Date(),
    });

    return { uid: id, ...dto };
  }

  async remove(id: string, ownerId: string) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const ref = this.collection.doc(id);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const doc = await ref.get();

    if (!doc.exists || doc.data().ownerId !== ownerId) {
      throw new NotFoundException('Proyecto no encontrado');
    }

    await ref.delete();
    return true;
  }
}
