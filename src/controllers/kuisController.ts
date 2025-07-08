import { Request, Response, NextFunction } from 'express';
import createHttpError from 'http-errors';
import { KuisModel } from '../models/Kuis';
import { PelajaranModel } from '../models/Pelajaran';

export class KuisController {
    static async addKuis(req: Request, res: Response, next: NextFunction) {
        try {
            const { idPelajaran, nomorKuis, soal, opsiA, opsiB, opsiC, opsiD, opsiJawaban } = req.body;

            // Validasi input - lebih fleksibel
            if (!idPelajaran) {
                throw createHttpError(400, 'ID Pelajaran harus disediakan.');
            }
            if (!nomorKuis || typeof nomorKuis !== 'number' || nomorKuis <= 0) {
                throw createHttpError(400, 'Nomor soal harus berupa angka positif.');
            }
            if (!soal || soal.trim() === '') {
                throw createHttpError(400, 'Soal harus diisi.');
            }
            if (!opsiA || opsiA.trim() === '') {
                throw createHttpError(400, 'Opsi A harus diisi.');
            }
            if (!opsiB || opsiB.trim() === '') {
                throw createHttpError(400, 'Opsi B harus diisi.');
            }
            if (!opsiC || opsiC.trim() === '') {
                throw createHttpError(400, 'Opsi C harus diisi.');
            }
            if (!opsiD || opsiD.trim() === '') {
                throw createHttpError(400, 'Opsi D harus diisi.');
            }
            if (!opsiJawaban || !['A', 'B', 'C', 'D'].includes(opsiJawaban)) {
                throw createHttpError(400, 'Opsi jawaban harus A, B, C, atau D.');
            }

            // Cek apakah pelajaran dengan idPelajaran ada
            const pelajaranExists = await PelajaranModel.findById(idPelajaran);
            if (!pelajaranExists) {
                throw createHttpError(404, 'Pelajaran tidak ditemukan.');
            }

            // Cek apakah nomor kuis sudah ada untuk pelajaran ini
            const kuisExists = await KuisModel.findOne({ idPelajaran, nomorKuis });
            if (kuisExists) {
                throw createHttpError(400, `Kuis dengan nomor ${nomorKuis} sudah ada untuk pelajaran ini.`);
            }

            // Simpan kuis baru ke database
            const kuisBaru = new KuisModel({
                idPelajaran,
                nomorKuis,
                soal: soal.trim(),
                opsiA: opsiA.trim(),
                opsiB: opsiB.trim(),
                opsiC: opsiC.trim(),
                opsiD: opsiD.trim(),
                opsiJawaban,
            });

            await kuisBaru.save();

            res.status(201).json({
                message: 'Kuis berhasil ditambahkan',
                kuis: kuisBaru,
            });

        } catch (error) {
            next(error);
        }
    }

    static async deleteKuis(req: Request, res: Response, next: NextFunction) {
        try {
            const { idKuis } = req.params;

            // Validasi input
            if (!idKuis) {
                throw createHttpError(400, 'ID Kuis harus disediakan.');
            }

            // Cek apakah kuis dengan idKuis ada
            const kuis = await KuisModel.findById(idKuis);
            if (!kuis) {
                throw createHttpError(404, 'Kuis tidak ditemukan.');
            }

            // Hapus kuis dari database
            await KuisModel.findByIdAndDelete(idKuis);

            res.status(200).json({
                message: 'Kuis berhasil dihapus',
                kuis,
            });

        } catch (error) {
            next(error);
        }
    }
}