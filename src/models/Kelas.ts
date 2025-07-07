import { getModelForClass, prop, pre } from '@typegoose/typegoose';

export class Kelas {
  @prop({ required: true, unique: true })
  public nomorKelas!: string;
}

export const KelasModel = getModelForClass(Kelas);