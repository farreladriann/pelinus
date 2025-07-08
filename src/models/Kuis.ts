import { getModelForClass, prop, Ref } from '@typegoose/typegoose';
import { Pelajaran } from './Pelajaran';

export class Kuis {
    @prop({ required: true, ref: () => Pelajaran })
    public idPelajaran!: Ref<Pelajaran>;

    @prop({ required: true })
    public nomorKuis!: number;

    @prop({ required: true })
    public soal!: string;

    @prop({ required: true })
    public opsiA!: string;

    @prop({ required: true })
    public opsiB!: string;

    @prop({ required: true })
    public opsiC!: string;

    @prop({ required: true })
    public opsiD!: string;

    @prop({ required: true })
    public opsiJawaban!: string;
}

export const KuisModel = getModelForClass(Kuis);