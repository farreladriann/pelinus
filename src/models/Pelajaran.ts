import { getModelForClass, prop, Ref } from '@typegoose/typegoose';
import { Kelas } from './Kelas';

export class Pelajaran {
  @prop({ required: true})
  public namaPelajaran!: string;

  @prop({ required: true})
  public logo!: Buffer;

  @prop({ ref: () => Kelas, required: true })
  public idKelas!: Ref<Kelas>;

  @prop({ required: true})
  public filePdfMateri!: Buffer;
}

export const PelajaranModel = getModelForClass(Pelajaran);